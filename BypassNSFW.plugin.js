/**
 * @name BypassNSFW
 * @author DLL0415
 * @description Lets you bypass NSFW/18+ channels.
 * @source https://github.com/DLL0415/BypassNSFW
 * @version 1.0

 */

module.exports = class BypassNSFW {
    start() {
        this.patchNSFWCheck();
    }

    stop() {
        BdApi.Patcher.unpatchAll("BypassNSFW");
    }

    patchNSFWCheck() {
        const GuildModule = BdApi.findModuleByProps("getChannels", "getVoiceChannelId");
        const PermissionsModule = BdApi.findModuleByProps("can", "getChannelPermissions");

        const UserSettingsProto = BdApi.findModule((m) =>
            typeof m?.default?.getCurrentUser === "function" &&
            typeof m?.default?.getCurrentUser()?.nsfwAllowed !== "undefined"
        )?.default?.getCurrentUser?.().__proto__;

        if (UserSettingsProto) {
            BdApi.Patcher.instead("BypassNSFW", UserSettingsProto, "nsfwAllowed", (_, __, orig) => {
                return true;
            });
        }

        const UserStore = BdApi.findModuleByProps("getCurrentUser");

        if (UserStore && UserStore.getCurrentUser) {
            BdApi.Patcher.after("BypassNSFW", UserStore, "getCurrentUser", (_, __, user) => {
                if (user && user.hasOwnProperty("nsfwAllowed")) user.nsfwAllowed = true;
                if (user && user.hasOwnProperty("ageVerified")) user.ageVerified = true;
                if (user && user.hasOwnProperty("age")) user.age = 21;
                if (user && user.hasOwnProperty("ageGateBypass")) user.ageGateBypass = true;
            });
        }
    }
};
