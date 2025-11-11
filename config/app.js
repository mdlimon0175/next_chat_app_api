const isProduction = process.env.NODE_ENV === "production";
const port = process.env.SERVER_PORT ?? 8000;
const app_url = process.env.APP_URL ?? `http://localhost:${port}`;

const db_host = process.env.DB_HOST ?? "localhost";
const db_port = process.env.DB_PORT ?? 27017;
const db_name = process.env.DB_NAME ?? "test_db";

const appConfig = {
    // app config
    isProduction,
    debug: process.env.NODE_ENV === "development",
    app_name: process.env.APP_NAME,
    port,
    app_url,
    frontend_url: process.env.FRONTEND_URL ?? "https://localhost:4000",

    // jwt config
    jwt_secret: process.env.JWT_SECRET_KEY ?? "jwt_secret",
    jwt_salt_round: parseInt(process.env.SALT_ROUNDS) ?? 10,
    token_expire: process.env.TOKEN_EXPIRE ?? "4h",

    // database config
    databaseURL: isProduction
        ? `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@${db_host}/${db_name}?appName=${process.env.DB_APPNAME}&retryWrites=true&w=majority`
        : `mongodb://${db_host}:${db_port}/${db_name}`,
};

module.exports = appConfig;
