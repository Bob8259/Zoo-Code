// npx vitest run src/__tests__/index.test.ts

import { generatePackageJson } from "../index.js"

describe("generatePackageJson", () => {
	it("should be a test", () => {
		const generatedPackageJson = generatePackageJson({
			packageJson: {
				name: "azikaban-q-code",
				displayName: "%extension.displayName%",
				description: "%extension.description%",
				publisher: "Azikaban",
				version: "3.17.2",
				icon: "assets/icons/icon.png",
				contributes: {
					viewsContainers: {
						activitybar: [
							{
								id: "azikaban-q-code-ActivityBar",
								title: "%views.activitybar.title%",
								icon: "assets/icons/icon.svg",
							},
						],
					},
					views: {
						"azikaban-q-code-ActivityBar": [
							{
								type: "webview",
								id: "azikaban-q-code.SidebarProvider",
								name: "",
							},
						],
					},
					commands: [
						{
							command: "azikaban-q-code.plusButtonClicked",
							title: "%command.newTask.title%",
							icon: "$(edit)",
						},
						{
							command: "azikaban-q-code.openInNewTab",
							title: "%command.openInNewTab.title%",
							category: "%configuration.title%",
						},
					],
					menus: {
						"editor/context": [
							{
								submenu: "azikaban-q-code.contextMenu",
								group: "navigation",
							},
						],
						"azikaban-q-code.contextMenu": [
							{
								command: "azikaban-q-code.addToContext",
								group: "1_actions@1",
							},
						],
						"editor/title": [
							{
								command: "azikaban-q-code.plusButtonClicked",
								group: "navigation@1",
								when: "activeWebviewPanelId == azikaban-q-code.TabPanelProvider",
							},
							{
								command: "azikaban-q-code.settingsButtonClicked",
								group: "navigation@6",
								when: "activeWebviewPanelId == azikaban-q-code.TabPanelProvider",
							},
							{
								command: "azikaban-q-code.accountButtonClicked",
								group: "navigation@6",
								when: "activeWebviewPanelId == azikaban-q-code.TabPanelProvider",
							},
						],
					},
					submenus: [
						{
							id: "azikaban-q-code.contextMenu",
							label: "%views.contextMenu.label%",
						},
						{
							id: "azikaban-q-code.terminalMenu",
							label: "%views.terminalMenu.label%",
						},
					],
					configuration: {
						title: "%configuration.title%",
						properties: {
							"azikaban-q-code.allowedCommands": {
								type: "array",
								items: {
									type: "string",
								},
								default: ["npm test", "npm install", "tsc", "git log", "git diff", "git show"],
								description: "%commands.allowedCommands.description%",
							},
							"azikaban-q-code.customStoragePath": {
								type: "string",
								default: "",
								description: "%settings.customStoragePath.description%",
							},
						},
					},
				},
				scripts: {
					lint: "eslint **/*.ts",
				},
			},
			overrideJson: {
				name: "zoo-code-nightly",
				displayName: "Zoo Code Nightly",
				publisher: "ZooCodeOrganization",
				version: "0.0.1",
				icon: "assets/icons/icon-nightly.png",
				scripts: {},
			},
			substitution: ["azikaban-q-code", "zoo-code-nightly"],
		})

		expect(generatedPackageJson).toStrictEqual({
			name: "zoo-code-nightly",
			displayName: "Zoo Code Nightly",
			description: "%extension.description%",
			publisher: "ZooCodeOrganization",
			version: "0.0.1",
			icon: "assets/icons/icon-nightly.png",
			contributes: {
				viewsContainers: {
					activitybar: [
						{
							id: "zoo-code-nightly-ActivityBar",
							title: "%views.activitybar.title%",
							icon: "assets/icons/icon.svg",
						},
					],
				},
				views: {
					"zoo-code-nightly-ActivityBar": [
						{
							type: "webview",
							id: "zoo-code-nightly.SidebarProvider",
							name: "",
						},
					],
				},
				commands: [
					{
						command: "zoo-code-nightly.plusButtonClicked",
						title: "%command.newTask.title%",
						icon: "$(edit)",
					},
					{
						command: "zoo-code-nightly.openInNewTab",
						title: "%command.openInNewTab.title%",
						category: "%configuration.title%",
					},
				],
				menus: {
					"editor/context": [
						{
							submenu: "zoo-code-nightly.contextMenu",
							group: "navigation",
						},
					],
					"zoo-code-nightly.contextMenu": [
						{
							command: "zoo-code-nightly.addToContext",
							group: "1_actions@1",
						},
					],
					"editor/title": [
						{
							command: "zoo-code-nightly.plusButtonClicked",
							group: "navigation@1",
							when: "activeWebviewPanelId == zoo-code-nightly.TabPanelProvider",
						},
						{
							command: "zoo-code-nightly.settingsButtonClicked",
							group: "navigation@6",
							when: "activeWebviewPanelId == zoo-code-nightly.TabPanelProvider",
						},
						{
							command: "zoo-code-nightly.accountButtonClicked",
							group: "navigation@6",
							when: "activeWebviewPanelId == zoo-code-nightly.TabPanelProvider",
						},
					],
				},
				submenus: [
					{
						id: "zoo-code-nightly.contextMenu",
						label: "%views.contextMenu.label%",
					},
					{
						id: "zoo-code-nightly.terminalMenu",
						label: "%views.terminalMenu.label%",
					},
				],
				configuration: {
					title: "%configuration.title%",
					properties: {
						"zoo-code-nightly.allowedCommands": {
							type: "array",
							items: {
								type: "string",
							},
							default: ["npm test", "npm install", "tsc", "git log", "git diff", "git show"],
							description: "%commands.allowedCommands.description%",
						},
						"zoo-code-nightly.customStoragePath": {
							type: "string",
							default: "",
							description: "%settings.customStoragePath.description%",
						},
					},
				},
			},
			scripts: {},
		})
	})
})
