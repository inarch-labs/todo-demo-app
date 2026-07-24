import { createPanelLoginHandler } from '@inarch/sdk/panel/auth'

export const POST = createPanelLoginHandler(process.env.INARCH_ADMIN_SECRET!)
