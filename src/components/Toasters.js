import { Position, Toaster } from '@blueprintjs/core'

export const GoodToaster = Toaster.create({
    className: "good-toaster",
    position: Position.TOP_RIGHT,
    maxToasts: 10
});

export const BadToaster = Toaster.create({
    className: "bad-toaster",
    position: Position.TOP_RIGHT,
    maxToasts: 10
});

export const WarningToaster = Toaster.create({
    className: "warning-toaster",
    position: Position.TOP_RIGHT,
    maxToasts: 10
});
