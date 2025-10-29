const sharp = require("sharp");
const { extname, join } = require("path");

const filePathname = require("../enum/filePathname");
const { getPublicFilePath, getPublicPath } = require("./helper");
sharp.cache(false);

async function imageResizer(fname, size = [40, 40]) {
    try {
        const fileExt = extname(fname);
        const public_path = getPublicPath();
        const file_path = getPublicFilePath(filePathname.USER);

        const width = size[0];
        const height = size[1];
        const iconFilename = fname.replace(fileExt, `_icon_${width}_${height}`) + fileExt;
        const iconPath = join(file_path, iconFilename);

        await sharp(join(public_path, file_path, fname))
                .resize(width, height)
                .toFile(join(public_path, iconPath));

        const icon_path = iconPath;
        const profile_path = join(file_path, fname);

        return [profile_path, icon_path];
    } catch (error) {
        throw error;
    }
}

module.exports = imageResizer;