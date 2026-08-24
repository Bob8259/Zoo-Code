import { HTMLAttributes, useState } from "react"
import { X } from "lucide-react"
import { Trans } from "react-i18next"
import { Package } from "@roo/package"

import { useAppTranslation } from "@/i18n/TranslationContext"
import { VSCodeCheckbox, VSCodeTextArea } from "@vscode/webview-ui-toolkit/react"
import { vscode } from "@/utils/vscode"
import { Button, Input, Slider, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui"

import { SetCachedStateField } from "./types"
import { SectionHeader } from "./SectionHeader"
import { Section } from "./Section"
import { SearchableSetting } from "./SearchableSetting"
import { AutoApproveToggle } from "./AutoApproveToggle"
import { MaxLimitInputs } from "./MaxLimitInputs"
import { useExtensionState } from "@/context/ExtensionStateContext"
import { useAutoApprovalState } from "@/hooks/useAutoApprovalState"
import { useAutoApprovalToggles } from "@/hooks/useAutoApprovalToggles"

type AutoApproveSettingsProps = HTMLAttributes<HTMLDivElement> & {
	alwaysAllowReadOnly?: boolean
	alwaysAllowReadOnlyOutsideWorkspace?: boolean
	alwaysAllowWrite?: boolean
	alwaysAllowWriteOutsideWorkspace?: boolean
	alwaysAllowWriteProtected?: boolean
	alwaysAllowMcp?: boolean
	alwaysAllowModeSwitch?: boolean
	alwaysAllowSubtasks?: boolean
	alwaysAllowExecute?: boolean
	enableCommandAutoReview?: boolean
	commandAutoReviewProfileId?: string
	commandAutoReviewPrompt?: string
	listApiConfigMeta?: any[]
	alwaysAllowFollowupQuestions?: boolean
	followupAutoApproveTimeoutMs?: number
	allowedCommands?: string[]
	allowedMaxRequests?: number | undefined
	allowedMaxCost?: number | undefined
	deniedCommands?: string[]
	notifyOnTaskComplete?: boolean
	setCachedStateField: SetCachedStateField<
		| "alwaysAllowReadOnly"
		| "alwaysAllowReadOnlyOutsideWorkspace"
		| "alwaysAllowWrite"
		| "alwaysAllowWriteOutsideWorkspace"
		| "alwaysAllowWriteProtected"
		| "alwaysAllowMcp"
		| "alwaysAllowModeSwitch"
		| "alwaysAllowSubtasks"
		| "alwaysAllowExecute"
		| "enableCommandAutoReview"
		| "commandAutoReviewProfileId"
		| "commandAutoReviewPrompt"
		| "alwaysAllowFollowupQuestions"
		| "followupAutoApproveTimeoutMs"
		| "allowedCommands"
		| "allowedMaxRequests"
		| "allowedMaxCost"
		| "deniedCommands"
		| "notifyOnTaskComplete"
	>
}

export const AutoApproveSettings = ({
	alwaysAllowReadOnly,
	alwaysAllowReadOnlyOutsideWorkspace,
	alwaysAllowWrite,
	alwaysAllowWriteOutsideWorkspace,
	alwaysAllowWriteProtected,
	alwaysAllowMcp,
	alwaysAllowModeSwitch,
	alwaysAllowSubtasks,
	alwaysAllowExecute,
	enableCommandAutoReview,
	commandAutoReviewProfileId,
	commandAutoReviewPrompt,
	listApiConfigMeta,
	alwaysAllowFollowupQuestions,
	followupAutoApproveTimeoutMs = 60000,
	allowedCommands,
	allowedMaxRequests,
	allowedMaxCost,
	deniedCommands,
	notifyOnTaskComplete,
	setCachedStateField,
	...props
}: AutoApproveSettingsProps) => {
	const { t } = useAppTranslation()
	const [commandInput, setCommandInput] = useState("")
	const [deniedCommandInput, setDeniedCommandInput] = useState("")
	const { autoApprovalEnabled, setAutoApprovalEnabled } = useExtensionState()

	const toggles = useAutoApprovalToggles()

	const { effectiveAutoApprovalEnabled } = useAutoApprovalState(toggles, autoApprovalEnabled)

	const handleAddCommand = () => {
		const currentCommands = allowedCommands ?? []

		if (commandInput && !currentCommands.includes(commandInput)) {
			const newCommands = [...currentCommands, commandInput]
			setCachedStateField("allowedCommands", newCommands)
			setCommandInput("")
			vscode.postMessage({ type: "updateSettings", updatedSettings: { allowedCommands: newCommands } })
		}
	}

	const handleAddDeniedCommand = () => {
		const currentCommands = deniedCommands ?? []

		if (deniedCommandInput && !currentCommands.includes(deniedCommandInput)) {
			const newCommands = [...currentCommands, deniedCommandInput]
			setCachedStateField("deniedCommands", newCommands)
			setDeniedCommandInput("")
			vscode.postMessage({ type: "updateSettings", updatedSettings: { deniedCommands: newCommands } })
		}
	}

	return (
		<div {...props}>
			<SectionHeader>{t("settings:sections.autoApprove")}</SectionHeader>

			<Section>
				<div className="space-y-4">
					<SearchableSetting
						settingId="auto-approve-enabled"
						section="autoApprove"
						label={t("settings:autoApprove.enabled")}>
						<VSCodeCheckbox
							checked={effectiveAutoApprovalEnabled}
							aria-label={t("settings:autoApprove.toggleAriaLabel")}
							onChange={() => {
								const newValue = !(autoApprovalEnabled ?? false)
								setAutoApprovalEnabled(newValue)
								vscode.postMessage({ type: "autoApprovalEnabled", bool: newValue })
							}}>
							<span className="font-medium">{t("settings:autoApprove.enabled")}</span>
						</VSCodeCheckbox>
						<div className="text-vscode-descriptionForeground text-sm mt-1">
							<p>{t("settings:autoApprove.description")}</p>
							<p>
								<Trans
									i18nKey="settings:autoApprove.toggleShortcut"
									components={{
										SettingsLink: (
											<a
												href="#"
												className="text-vscode-textLink-foreground hover:underline cursor-pointer"
												onClick={(e) => {
													e.preventDefault()
													// Send message to open keyboard shortcuts with search for toggle command
													vscode.postMessage({
														type: "openKeyboardShortcuts",
														text: `${Package.name}.toggleAutoApprove`,
													})
												}}
											/>
										),
									}}
								/>
							</p>
						</div>
					</SearchableSetting>

					<AutoApproveToggle
						alwaysAllowReadOnly={alwaysAllowReadOnly}
						alwaysAllowWrite={alwaysAllowWrite}
						alwaysAllowMcp={alwaysAllowMcp}
						alwaysAllowModeSwitch={alwaysAllowModeSwitch}
						alwaysAllowSubtasks={alwaysAllowSubtasks}
						alwaysAllowExecute={alwaysAllowExecute}
						alwaysAllowFollowupQuestions={alwaysAllowFollowupQuestions}
						onToggle={(key, value) => setCachedStateField(key, value)}
					/>

					<MaxLimitInputs
						allowedMaxRequests={allowedMaxRequests}
						allowedMaxCost={allowedMaxCost}
						onMaxRequestsChange={(value) => setCachedStateField("allowedMaxRequests", value)}
						onMaxCostChange={(value) => setCachedStateField("allowedMaxCost", value)}
					/>

					<SearchableSetting
						settingId="auto-approve-task-notification"
						section="autoApprove"
						label={t("settings:autoApprove.taskNotification.label")}>
						<VSCodeCheckbox
							checked={notifyOnTaskComplete ?? true}
							onChange={(e: any) => setCachedStateField("notifyOnTaskComplete", e.target.checked)}
							data-testid="notify-on-task-complete-checkbox">
							<span className="font-medium">{t("settings:autoApprove.taskNotification.label")}</span>
						</VSCodeCheckbox>
						<div className="text-vscode-descriptionForeground text-sm mt-1">
							{t("settings:autoApprove.taskNotification.description")}
						</div>
					</SearchableSetting>
				</div>

				{/* ADDITIONAL SETTINGS */}

				{alwaysAllowReadOnly && (
					<div className="flex flex-col gap-3 pl-3 border-l-2 border-vscode-button-background">
						<div className="flex items-center gap-4 font-bold">
							<span className="codicon codicon-eye" />
							<div>{t("settings:autoApprove.readOnly.label")}</div>
						</div>
						<SearchableSetting
							settingId="auto-approve-readonly-outside-workspace"
							section="autoApprove"
							label={t("settings:autoApprove.readOnly.outsideWorkspace.label")}>
							<VSCodeCheckbox
								checked={alwaysAllowReadOnlyOutsideWorkspace}
								onChange={(e: any) =>
									setCachedStateField("alwaysAllowReadOnlyOutsideWorkspace", e.target.checked)
								}
								data-testid="always-allow-readonly-outside-workspace-checkbox">
								<span className="font-medium">
									{t("settings:autoApprove.readOnly.outsideWorkspace.label")}
								</span>
							</VSCodeCheckbox>
							<div className="text-vscode-descriptionForeground text-sm mt-1">
								{t("settings:autoApprove.readOnly.outsideWorkspace.description")}
							</div>
						</SearchableSetting>
					</div>
				)}

				{alwaysAllowWrite && (
					<div className="flex flex-col gap-3 pl-3 border-l-2 border-vscode-button-background">
						<div className="flex items-center gap-4 font-bold">
							<span className="codicon codicon-edit" />
							<div>{t("settings:autoApprove.write.label")}</div>
						</div>
						<SearchableSetting
							settingId="auto-approve-write-outside-workspace"
							section="autoApprove"
							label={t("settings:autoApprove.write.outsideWorkspace.label")}>
							<VSCodeCheckbox
								checked={alwaysAllowWriteOutsideWorkspace}
								onChange={(e: any) =>
									setCachedStateField("alwaysAllowWriteOutsideWorkspace", e.target.checked)
								}
								data-testid="always-allow-write-outside-workspace-checkbox">
								<span className="font-medium">
									{t("settings:autoApprove.write.outsideWorkspace.label")}
								</span>
							</VSCodeCheckbox>
							<div className="text-vscode-descriptionForeground text-sm mt-1">
								{t("settings:autoApprove.write.outsideWorkspace.description")}
							</div>
						</SearchableSetting>
						<SearchableSetting
							settingId="auto-approve-write-protected"
							section="autoApprove"
							label={t("settings:autoApprove.write.protected.label")}>
							<VSCodeCheckbox
								checked={alwaysAllowWriteProtected}
								onChange={(e: any) =>
									setCachedStateField("alwaysAllowWriteProtected", e.target.checked)
								}
								data-testid="always-allow-write-protected-checkbox">
								<span className="font-medium">{t("settings:autoApprove.write.protected.label")}</span>
							</VSCodeCheckbox>
							<div className="text-vscode-descriptionForeground text-sm mt-1 mb-3">
								{t("settings:autoApprove.write.protected.description")}
							</div>
						</SearchableSetting>
					</div>
				)}

				{alwaysAllowFollowupQuestions && (
					<div className="flex flex-col gap-3 pl-3 border-l-2 border-vscode-button-background">
						<div className="flex items-center gap-4 font-bold">
							<span className="codicon codicon-question" />
							<div>{t("settings:autoApprove.followupQuestions.label")}</div>
						</div>
						<SearchableSetting
							settingId="auto-approve-followup-timeout"
							section="autoApprove"
							label={t("settings:autoApprove.followupQuestions.timeoutLabel")}>
							<div className="flex items-center gap-2">
								<Slider
									min={1000}
									max={300000}
									step={1000}
									value={[followupAutoApproveTimeoutMs]}
									onValueChange={([value]) =>
										setCachedStateField("followupAutoApproveTimeoutMs", value)
									}
									data-testid="followup-timeout-slider"
								/>
								<span className="w-20">{followupAutoApproveTimeoutMs / 1000}s</span>
							</div>
							<div className="text-vscode-descriptionForeground text-sm mt-1">
								{t("settings:autoApprove.followupQuestions.timeoutLabel")}
							</div>
						</SearchableSetting>
					</div>
				)}

				{alwaysAllowExecute && (
					<div className="flex flex-col gap-3 pl-3 border-l-2 border-vscode-button-background">
						<div className="flex items-center gap-4 font-bold">
							<span className="codicon codicon-terminal" />
							<div>{t("settings:autoApprove.execute.label")}</div>
						</div>

						<SearchableSetting
							settingId="auto-approve-allowed-commands"
							section="autoApprove"
							label={t("settings:autoApprove.execute.allowedCommands")}>
							<label className="block font-medium mb-1" data-testid="allowed-commands-heading">
								{t("settings:autoApprove.execute.allowedCommands")}
							</label>
							<div className="text-vscode-descriptionForeground text-sm mt-1">
								{t("settings:autoApprove.execute.allowedCommandsDescription")}
							</div>
						</SearchableSetting>

						<div className="flex gap-2">
							<Input
								value={commandInput}
								onChange={(e: any) => setCommandInput(e.target.value)}
								onKeyDown={(e: any) => {
									if (e.key === "Enter") {
										e.preventDefault()
										handleAddCommand()
									}
								}}
								placeholder={t("settings:autoApprove.execute.commandPlaceholder")}
								className="grow"
								data-testid="command-input"
							/>
							<Button className="h-8" onClick={handleAddCommand} data-testid="add-command-button">
								{t("settings:autoApprove.execute.addButton")}
							</Button>
						</div>

						<div className="flex flex-wrap gap-2">
							{(allowedCommands ?? []).map((cmd, index) => (
								<Button
									key={index}
									variant="secondary"
									data-testid={`remove-command-${index}`}
									onClick={() => {
										const newCommands = (allowedCommands ?? []).filter((_, i) => i !== index)
										setCachedStateField("allowedCommands", newCommands)

										vscode.postMessage({
											type: "updateSettings",
											updatedSettings: { allowedCommands: newCommands },
										})
									}}>
									<div className="flex flex-row items-center gap-1">
										<div>{cmd}</div>
										<X className="text-foreground scale-75" />
									</div>
								</Button>
							))}
						</div>

						{/* Denied Commands Section */}
						<SearchableSetting
							settingId="auto-approve-denied-commands"
							section="autoApprove"
							label={t("settings:autoApprove.execute.deniedCommands")}
							className="mt-6">
							<label className="block font-medium mb-1" data-testid="denied-commands-heading">
								{t("settings:autoApprove.execute.deniedCommands")}
							</label>
							<div className="text-vscode-descriptionForeground text-sm mt-1">
								{t("settings:autoApprove.execute.deniedCommandsDescription")}
							</div>
						</SearchableSetting>

						<div className="flex gap-2">
							<Input
								value={deniedCommandInput}
								onChange={(e: any) => setDeniedCommandInput(e.target.value)}
								onKeyDown={(e: any) => {
									if (e.key === "Enter") {
										e.preventDefault()
										handleAddDeniedCommand()
									}
								}}
								placeholder={t("settings:autoApprove.execute.deniedCommandPlaceholder")}
								className="grow"
								data-testid="denied-command-input"
							/>
							<Button
								className="h-8"
								onClick={handleAddDeniedCommand}
								data-testid="add-denied-command-button">
								{t("settings:autoApprove.execute.addButton")}
							</Button>
						</div>

						<div className="flex flex-wrap gap-2">
							{(deniedCommands ?? []).map((cmd, index) => (
								<Button
									key={index}
									variant="secondary"
									data-testid={`remove-denied-command-${index}`}
									onClick={() => {
										const newCommands = (deniedCommands ?? []).filter((_, i) => i !== index)
										setCachedStateField("deniedCommands", newCommands)

										vscode.postMessage({
											type: "updateSettings",
											updatedSettings: { deniedCommands: newCommands },
										})
									}}>
									<div className="flex flex-row items-center gap-1">
										<div>{cmd}</div>
										<X className="text-foreground scale-75" />
									</div>
								</Button>
							))}
						</div>

						{/* Command Auto-Review Section */}
						<div className="border-t border-vscode-settings-sectionBorder pt-4 mt-4">
							<SearchableSetting
								settingId="enable-command-auto-review"
								section="autoApprove"
								label={t("settings:autoApprove.execute.autoReview.label")}>
								<VSCodeCheckbox
									checked={enableCommandAutoReview}
									onChange={(e: any) =>
										setCachedStateField("enableCommandAutoReview", e.target.checked)
									}
									data-testid="enable-command-auto-review-checkbox">
									<span className="font-medium">
										{t("settings:autoApprove.execute.autoReview.label")}
									</span>
								</VSCodeCheckbox>
								<div className="text-vscode-descriptionForeground text-sm mt-1">
									{t("settings:autoApprove.execute.autoReview.description")}
								</div>
							</SearchableSetting>

							{enableCommandAutoReview && (
								<div className="flex flex-col gap-3 pl-3 border-l-2 border-vscode-button-background mt-3">
									<SearchableSetting
										settingId="command-auto-review-profile"
										section="autoApprove"
										label={t("settings:autoApprove.execute.autoReview.profileLabel")}>
										<label className="block font-medium mb-1">
											{t("settings:autoApprove.execute.autoReview.profileLabel")}
										</label>
										<Select
											value={commandAutoReviewProfileId || "default"}
											onValueChange={(value) =>
												setCachedStateField("commandAutoReviewProfileId", value)
											}
											data-testid="command-auto-review-profile-select">
											<SelectTrigger className="w-full">
												<SelectValue
													placeholder={t(
														"settings:autoApprove.execute.autoReview.profilePlaceholder",
													)}
												/>
											</SelectTrigger>
											<SelectContent>
												<SelectItem value="default">
													{t("settings:autoApprove.execute.autoReview.profileDefault")}
												</SelectItem>
												{(listApiConfigMeta || []).map((config) => (
													<SelectItem key={config.id} value={config.id}>
														{config.name}
													</SelectItem>
												))}
											</SelectContent>
										</Select>
										<div className="text-vscode-descriptionForeground text-sm mt-1">
											{t("settings:autoApprove.execute.autoReview.profileDescription")}
										</div>
									</SearchableSetting>

									<SearchableSetting
										settingId="command-auto-review-prompt"
										section="autoApprove"
										label={t("settings:autoApprove.execute.autoReview.promptLabel")}>
										<label className="block font-medium mb-1">
											{t("settings:autoApprove.execute.autoReview.promptLabel")}
										</label>
										<VSCodeTextArea
											resize="vertical"
											value={commandAutoReviewPrompt || ""}
											onInput={(e) => {
												const value =
													(e as unknown as CustomEvent)?.detail?.target?.value ??
													((e as any).target as HTMLTextAreaElement).value
												setCachedStateField("commandAutoReviewPrompt", value)
											}}
											rows={6}
											className="w-full"
											placeholder={t("settings:autoApprove.execute.autoReview.promptPlaceholder")}
											data-testid="command-auto-review-prompt-textarea"
										/>
										<div className="text-vscode-descriptionForeground text-sm mt-1">
											{t("settings:autoApprove.execute.autoReview.promptDescription")}
										</div>
									</SearchableSetting>
								</div>
							)}
						</div>
					</div>
				)}
			</Section>
		</div>
	)
}
