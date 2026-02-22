# 環境構築手順書

# 1 本書について

本書では、温熱環境シミュレーション機能（以下「本システム」という。）の利用環境構築手順について記載しています。本システムは、PLATEAUの3D都市モデルおよび樹木データを活用し、対象エリアの温熱環境のシミュレーションを行う機能です。

本システムは、3D都市モデルを活用した樹木管理機能及び緑の効果の定量的評価を支援する取り組みである「樹木データを活用した温熱環境シミュレータの開発」の一部として開発されたWebアプリケーションです。

本システムの構成や仕様の詳細については以下も参考にしてください。

- [技術検証レポート](https://www.mlit.go.jp/plateau/file/libraries/doc/plateau_tech_doc_0136_ver01.pdf)

# 2 動作環境

本システムのWebアプリケーションサーバサイドの動作環境は以下のとおりです。

| 項目 | 最小動作環境 | 推奨動作環境 |
| --- | --- | --- |
| OS | Microsoft Windows 10 以上　または macOS 12 Monterey 以上 | 同左 |
| CPU | Pentium 4 以上 | 同左 |
| メモリ | 8GB以上 | 同左 |

OpenFOAM シミュレーション計算サーバの動作環境は以下のとおりです。

| 項目 | 動作環境 |
| --- | --- |
| OS | Linux 64bit |
| ソフトウェア | OpenFOAM v2506 |

クライアント（ブラウザ）の動作環境は以下のとおりです。

| 項目 | 動作環境 |
| --- | --- |
| ブラウザ | Google Chrome 最新版 |

本システムで使用するソフトウェアおよびサービスの一覧は以下のとおりです。

| 種別 | 名称 | バージョン | 内容 |
| --- | --- | --- | --- |
| オープンソースソフトウェア | [Apache HTTP Server](https://httpd.apache.org/) | 2.4.58 | Webアプリを配信するためのWebサーバ |
| オープンソースソフトウェア | [PostGIS](https://github.com/postgis/postgis) | 3.4.1 | PostgreSQL で位置情報を扱うための拡張機能 |
| オープンソースソフトウェア | [OpenFOAM](https://www.openfoam.com/) | v2506 | 数値流体計算（CFD）エンジン。温熱環境シミュレーションの中核 |
| オープンソースRDBMS | [PostgreSQL](https://github.com/postgres/postgres) | 16.2 | 各種データを格納するリレーショナルデータベース |
| オープンソースライブラリ | [React.js](https://github.com/facebook/react) | 19.x | UIを構築するためのJavaScriptライブラリ |
| オープンソースライブラリ | [MapLibre GL JS](https://github.com/maplibre/maplibre-gl-js) | 5.x | 地図表示ライブラリ |
| オープンソースライブラリ | [CesiumJS](https://github.com/CesiumGS/cesium) | 1.136 | 3Dビューア用ライブラリ |
| オープンソースライブラリ | [MUI（Material UI）](https://mui.com/) | 7.x | UIコンポーネントライブラリ |
| クラウドサービス | [Firebase](https://firebase.google.com/) | 12.x | 認証機能（Firebase Authentication）を提供 |
| 商用クラウド | [Cesium ion](https://cesium.com/platform/cesium-ion/) | - | 3Dデータの変換と配信サービス |

# 3 事前準備

本システムで利用する下記のソフトウェア・サービスを準備します。

（1）データベースの準備

[こちら](https://github.com/postgres/postgres)を利用してPostgreSQLサーバを起動します。その上で、位置情報を扱うための拡張機能である [PostGIS](https://github.com/postgis/postgis) をインストールします。

（2）Webサーバの準備

[こちら](https://httpd.apache.org/)を利用してWebサーバを起動します。ビルド済みのフロントエンド資材を配信するためのドキュメントルートを設定してください。

（3）Node.js の準備

[こちら](https://nodejs.org/)からNode.js LTS版（v20以上）をインストールします。フロントエンドのビルドに使用します。

（4）Firebase プロジェクトの準備

[Firebase コンソール](https://console.firebase.google.com/)で新規プロジェクトを作成します。Authentication を有効化し、メール/パスワード認証プロバイダを有効にします。プロジェクトの設定画面から API キーや Auth ドメインなどの接続情報を控えてください。

（5）Cesium ion の準備

[Cesium ion](https://cesium.com/platform/cesium-ion/) のアカウントを取得し、3D都市モデルデータ（建物・樹木等）をアップロードします。タイル変換処理が完了したら、アセットIDとアクセストークンを控えてください。

（6）OpenFOAM のインストール

シミュレーション計算サーバ（Linux 64bit）に [OpenFOAM v2506](https://www.openfoam.com/news/main-news/openfoam-v2506) をインストールします。インストール手順は公式サイトを参照してください。

# 4 インストール手順

（1）リポジトリの取得

[こちら](https://github.com/Project-PLATEAU/green-thermal-simulation)から温熱環境シミュレーション機能のソースコードをダウンロードします。

（2）環境変数の設定

プロジェクトルート直下に `.env` ファイルを作成し、以下の環境変数を設定します。

```
VITE_API_ENDPOINT=<バックエンドAPIのエンドポイント>
VITE_FIREBASE_API_KEY=<FirebaseのAPIキー>
VITE_FIREBASE_AUTH_DOMAIN=<FirebaseのAuthドメイン>
VITE_FIREBASE_PROJECT_ID=<FirebaseのプロジェクトID>
VITE_FIREBASE_STORAGE_BUCKET=<FirebaseのStorageバケット>
VITE_FIREBASE_APP_ID=<FirebaseのアプリID>
VITE_FIREBASE_MEASUREMENT_ID=<Firebaseの計測ID>
VITE_CESIUM_ION_TOKEN=<Cesium ionのアクセストークン>
VITE_CESIUM_ASSET_ID=<アセットID>
```

`.env` ファイルは `.gitignore` で管理対象外となっています。誤ってGitにコミットしないよう注意してください。

（3）依存ライブラリのインストールとビルド

依存パッケージをインストールし、本番用ビルドを実行します。

```bash
npm install
npm run build
```

ビルド成果物は `dist` ディレクトリに出力されます。

（4）Webサーバへの配置

`dist` ディレクトリの内容を、3（2）で準備したWebサーバのドキュメントルートに配置します。SPAのため、すべてのリクエストを `index.html` にフォールバックするよう `.htaccess` を設定してください。

# 5 OpenFOAM 植生キャノピーモデルの構築

本システムのシミュレーション計算には、OpenFOAM 標準ソルバーに植生キャノピーモデル（`canopyModels_v2506`）を追加した環境が必要です。OpenFOAM 計算サーバ（Linux 64bit）で以下の手順を実施してください。

（1）キャノピーモデルのコンパイル

リポジトリに同梱されている `canopyModels_v2506_tar.gz` を展開し、OpenFOAM の `wmake` でコンパイルします。コンパイルが成功すると `$FOAM_USER_LIBBIN/libpreFlowModels.so` が生成されます。

（2）計算ケースへの組み込み

計算ケースの `system/controlDict` に生成したライブラリを読み込む設定を追加し、`constant/fvOptions` に植生キャノピーモデルのソース項を設定します。

（3）シミュレーションの実行

設定完了後、`buoyantBoussinesqSimpleFoam` ソルバーを実行します。1回のシミュレーション実行には数時間程度を要します。計算完了後、バックエンドAPIが結果を読み取り、フロントエンドのレポート画面に反映します。

# 6 バックエンドAPIの構築

PostgreSQLに接続し、本システム用のデータベースを作成します。PostGIS拡張を有効化した上で、バックエンドAPIの実装に合わせてテーブルを作成してください。バックエンドAPIはシミュレーションプロジェクトの管理およびOpenFOAM計算処理のトリガーを担います。

# 7 初期データの投入

本システムの稼働に必要なデータを投入します。

（1）3D都市モデルデータの登録

3D都市モデル（建物モデル・樹木モデル等）を Amazon S3 にアップロードします。

（2）ユーザの登録

Firebase コンソールまたはバックエンドAPIのユーザ管理機能から初期ユーザを登録します。ユーザには用途に応じて閲覧・編集・管理などの権限を付与してください。

# 8 動作確認

WebサーバのURLにブラウザからアクセスし、ログイン画面が表示されることを確認します。登録したユーザでログインし、プロジェクト一覧画面が表示されることを確認してください。新規プロジェクトを作成し、地図上でシミュレーション対象領域を指定後、気温・湿度・風速・風向きなどの環境条件を入力してシミュレーションを実行します。
