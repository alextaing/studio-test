export default function getStudioViteOptions(args, studioConfig, pathToUserProjectRoot) {
    const serverOptions = {
        port: studioConfig.port,
        open: args.mode === "development" &&
            args.command === "serve" &&
            !process.env.YEXT_CBD_BRANCH &&
            studioConfig.openBrowser,
        watch: {
            ignored: pathToUserProjectRoot,
        },
    };
    return {
        server: serverOptions,
    };
}
//# sourceMappingURL=getStudioViteOptions.js.map