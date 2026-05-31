import { render, screen } from "@/utils/test-utils"

import { TranslationProvider } from "@/i18n/__mocks__/TranslationContext"

import { SubtaskSettings } from "../SubtaskSettings"

vi.mock("@/i18n/TranslationContext", () => {
	const actual = vi.importActual("@/i18n/TranslationContext")
	return {
		...actual,
		useAppTranslation: () => ({
			t: (key: string) => key,
		}),
	}
})

describe("SubtaskSettings", () => {
	const setCachedStateField = vi.fn()

	beforeEach(() => {
		setCachedStateField.mockClear()
	})

	it("renders subtask profile selector with configured value", () => {
		render(
			<TranslationProvider>
				<SubtaskSettings
					subtaskApiConfigProfileId="profile-1"
					listApiConfigMeta={[{ id: "profile-1", name: "Fast Model" }]}
					setCachedStateField={setCachedStateField}
				/>
			</TranslationProvider>,
		)

		expect(screen.getByText("settings:subtasks.profileLabel")).toBeInTheDocument()
		expect(document.querySelector('[data-setting-section="subtasks"]')).toBeInTheDocument()
		expect(document.querySelector('[data-setting-id="subtask-api-config-profile"]')).toBeInTheDocument()
	})
})
