import { render, screen } from "@/utils/test-utils"

import { TranslationProvider } from "@/i18n/__mocks__/TranslationContext"

import { AutoApproveSettings } from "../AutoApproveSettings"

vi.mock("@/i18n/TranslationContext", () => {
	const actual = vi.importActual("@/i18n/TranslationContext")
	return {
		...actual,
		useAppTranslation: () => ({
			t: (key: string) => key,
		}),
	}
})

vi.mock("@/context/ExtensionStateContext", () => ({
	useExtensionState: () => ({
		autoApprovalEnabled: false,
		setAutoApprovalEnabled: vi.fn(),
	}),
}))

vi.mock("@/hooks/useAutoApprovalState", () => ({
	useAutoApprovalState: () => ({
		effectiveAutoApprovalEnabled: false,
	}),
}))

vi.mock("@/hooks/useAutoApprovalToggles", () => ({
	useAutoApprovalToggles: () => ({}),
}))

describe("AutoApproveSettings subtask profile", () => {
	const setCachedStateField = vi.fn()

	beforeEach(() => {
		setCachedStateField.mockClear()
	})

	it("renders subtask profile selector with configured value", () => {
		render(
			<TranslationProvider>
				<AutoApproveSettings
					alwaysAllowSubtasks
					subtaskApiConfigProfileId="profile-1"
					listApiConfigMeta={[{ id: "profile-1", name: "Fast Model" }]}
					setCachedStateField={setCachedStateField}
				/>
			</TranslationProvider>,
		)

		expect(screen.getByText("settings:autoApprove.subtasks.profileLabel")).toBeInTheDocument()
		expect(
			document.querySelector('[data-setting-id="subtask-api-config-profile"]'),
		).toBeInTheDocument()
	})
})
