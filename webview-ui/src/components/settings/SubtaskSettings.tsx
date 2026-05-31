import { HTMLAttributes } from "react"

import { useAppTranslation } from "@/i18n/TranslationContext"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui"

import { SetCachedStateField } from "./types"
import { SectionHeader } from "./SectionHeader"
import { Section } from "./Section"
import { SearchableSetting } from "./SearchableSetting"

type SubtaskSettingsProps = HTMLAttributes<HTMLDivElement> & {
	subtaskApiConfigProfileId?: string
	listApiConfigMeta?: { id: string; name: string }[]
	setCachedStateField: SetCachedStateField<"subtaskApiConfigProfileId">
}

export const SubtaskSettings = ({
	subtaskApiConfigProfileId,
	listApiConfigMeta,
	setCachedStateField,
	...props
}: SubtaskSettingsProps) => {
	const { t } = useAppTranslation()

	return (
		<div {...props}>
			<SectionHeader>{t("settings:sections.subtasks")}</SectionHeader>

			<Section>
				<div className="text-vscode-descriptionForeground text-sm mb-4">{t("settings:subtasks.description")}</div>

				<SearchableSetting
					settingId="subtask-api-config-profile"
					section="subtasks"
					label={t("settings:subtasks.profileLabel")}>
					<label className="block font-medium mb-1">{t("settings:subtasks.profileLabel")}</label>
					<Select
						value={subtaskApiConfigProfileId || "default"}
						onValueChange={(value) => setCachedStateField("subtaskApiConfigProfileId", value)}
						data-testid="subtask-api-config-profile-select">
						<SelectTrigger className="w-full">
							<SelectValue placeholder={t("settings:subtasks.profilePlaceholder")} />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="default">{t("settings:subtasks.profileDefault")}</SelectItem>
							{(listApiConfigMeta || []).map((config) => (
								<SelectItem key={config.id} value={config.id}>
									{config.name}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
					<div className="text-vscode-descriptionForeground text-sm mt-1">
						{t("settings:subtasks.profileDescription")}
					</div>
				</SearchableSetting>
			</Section>
		</div>
	)
}
