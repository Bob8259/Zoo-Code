import packageJson from "../../package.json"
import { Package } from "../package"
import { ClineProvider } from "../../core/webview/ClineProvider"

describe("package manifest consistency", () => {
	it("should register the sidebar provider with the same id declared in package.json", () => {
		const views = packageJson.contributes?.views as Record<string, Array<{ id?: string }>> | undefined
		const sidebarView = Object.values(views ?? {})
			.flat()
			.find((view) => view.id?.endsWith(".SidebarProvider"))

		expect(sidebarView?.id).toBeDefined()
		expect(ClineProvider.sideBarId).toBe(sidebarView?.id)
		expect(ClineProvider.sideBarId).toBe(`${Package.name}.SidebarProvider`)
	})

	it("should declare commands using the same extension name prefix as runtime", () => {
		const commands = packageJson.contributes?.commands as Array<{ command?: string }> | undefined
		const sampleCommand = commands?.[0]?.command

		expect(sampleCommand).toBeDefined()
		expect(sampleCommand?.startsWith(`${Package.name}.`)).toBe(true)
	})

	it("should declare configuration keys using the same extension name prefix as runtime", () => {
		const properties = packageJson.contributes?.configuration?.properties as Record<string, unknown> | undefined
		const sampleKey = Object.keys(properties ?? {})[0]

		expect(sampleKey).toBeDefined()
		expect(sampleKey?.startsWith(`${Package.name}.`)).toBe(true)
	})
})
