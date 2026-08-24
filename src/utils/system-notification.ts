import { execFile } from "child_process"
import * as path from "path"

export interface SystemNotificationOptions {
	title: string
	message: string
}

/**
 * Toasts are only rendered for an AppUserModelID that is registered in the Start
 * menu. Windows PowerShell always registers this one, so it is safe to borrow.
 */
const WINDOWS_TOAST_APP_ID = "{1AC14E77-02E7-4E5D-B744-2EB1AE5198B7}\\WindowsPowerShell\\v1.0\\powershell.exe"

/**
 * Values are read from the environment rather than interpolated into the script
 * so that titles and messages cannot break out of their quoting.
 */
const WINDOWS_TOAST_SCRIPT = `
$ErrorActionPreference = 'Stop'
[void][Windows.UI.Notifications.ToastNotificationManager, Windows.UI.Notifications, ContentType = WindowsRuntime]
[void][Windows.Data.Xml.Dom.XmlDocument, Windows.Data.Xml.Dom, ContentType = WindowsRuntime]
$template = [Windows.UI.Notifications.ToastNotificationManager]::GetTemplateContent([Windows.UI.Notifications.ToastTemplateType]::ToastText02)
$nodes = $template.GetElementsByTagName('text')
[void]$nodes.Item(0).AppendChild($template.CreateTextNode($env:ZOO_NOTIFICATION_TITLE))
[void]$nodes.Item(1).AppendChild($template.CreateTextNode($env:ZOO_NOTIFICATION_MESSAGE))
$toast = New-Object Windows.UI.Notifications.ToastNotification $template
[Windows.UI.Notifications.ToastNotificationManager]::CreateToastNotifier($env:ZOO_NOTIFICATION_APP_ID).Show($toast)
`

const MACOS_NOTIFICATION_SCRIPT =
	'display notification (system attribute "ZOO_NOTIFICATION_MESSAGE") with title (system attribute "ZOO_NOTIFICATION_TITLE")'

const run = (file: string, args: string[], env: NodeJS.ProcessEnv): Promise<void> =>
	new Promise((resolve, reject) => {
		execFile(file, args, { env: { ...process.env, ...env }, windowsHide: true }, (error) =>
			error ? reject(error) : resolve(),
		)
	})

const windowsPowerShellPath = (): string =>
	path.join(process.env.SystemRoot || "C:\\Windows", "System32", "WindowsPowerShell", "v1.0", "powershell.exe")

/**
 * Shows a notification through the operating system so that it is visible even
 * when the editor is unfocused or minimized.
 */
export async function showSystemNotification({ title, message }: SystemNotificationOptions): Promise<void> {
	const env: NodeJS.ProcessEnv = {
		ZOO_NOTIFICATION_TITLE: title,
		ZOO_NOTIFICATION_MESSAGE: message,
		ZOO_NOTIFICATION_APP_ID: WINDOWS_TOAST_APP_ID,
	}

	try {
		switch (process.platform) {
			case "win32":
				// PowerShell only accepts UTF-16LE when decoding an encoded command.
				await run(
					windowsPowerShellPath(),
					[
						"-NoProfile",
						"-NonInteractive",
						"-WindowStyle",
						"Hidden",
						"-EncodedCommand",
						Buffer.from(WINDOWS_TOAST_SCRIPT, "utf16le").toString("base64"),
					],
					env,
				)
				return
			case "darwin":
				await run("osascript", ["-e", MACOS_NOTIFICATION_SCRIPT], env)
				return
			case "linux":
				await run("notify-send", [title, message], env)
				return
			default:
				console.warn(`[showSystemNotification] Unsupported platform: ${process.platform}`)
				return
		}
	} catch (error) {
		console.error(
			`[showSystemNotification] Failed to send a system notification: ${(error as Error)?.message ?? String(error)}`,
		)
	}
}
