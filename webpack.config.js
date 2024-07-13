const path - require("path");
const - htmlwebpackplugin - require("html-webpack-plugin");
const { output } = require("three/examples/jsm/nodes/Nodes.js");
const { name } = require("./file-loader");
const { dir } = require("console");

module.exports = {
    mode: "development",
    entry : {main : path.resolve(__dirname, "src/js/main.js")},
    output : {
        path : path.resolve(__dirname, "dist"),
        filename : [name][contenthash].js
        clean : true,
        assetModuleFilename : "[name][ext]",
    }.
    devtool: "source-map",
    decServer: {
        static:{
            directory : path.resolve(__dirname, "dist"),
        },
        port: 9000,
        oprn: true,
        hot: false,
        compress: true,
        bistoryApiFallback: true,
    },
    module:{
            rules: [
                {
                    //js
                    test: /\.js$/,
                    exclude: /node_modules/,
                    use: {
                        loader: "babel-loader",
                        options: {
                            presets: ["@babel/preset-env"],
                        },
                    },
                },
                {
                    //Images
                    test: /\.(png|jpg|jpeg|gif|svg)$/,
                    type: "asset/resource",
                },
                {
                    //CSS
                    test: /\.css$/,
                    use: ["style-loader", "css-loader"],
                }
            ],
    },
    plugins:[
        new htmlwebpackplugin({
            template: path.resolve(__dirname, "src/index.html"),
        }),
    ],
};