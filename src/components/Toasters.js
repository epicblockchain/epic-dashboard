import { Position, Toaster } from '@blueprintjs/core'

export const EpicToaster = Toaster.create({
    className: "epic-toaster",
    position: Position.TOP_RIGHT,
    maxToasts: 10
});

