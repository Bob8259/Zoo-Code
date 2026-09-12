import { StructuredEditTool } from "./EditTool"

export class ApplyDiffTool extends StructuredEditTool<"apply_diff"> {
	constructor() {
		super("apply_diff")
	}
}

export const applyDiffTool = new ApplyDiffTool()
