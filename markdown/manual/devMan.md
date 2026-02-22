# 環境構築手順書

# 1 本書について

本書では、温熱環境シミュレーション機能（以下「本システム」という。）の利用環境構築手順について記載しています。本システムは、PLATEAUの3D都市モデルおよび樹木データを活用し、任意の環境条件下における気温・湿度・WBGT（暑さ指数）等の温熱環境を数値流体計算（CFD）によりシミュレートするWebアプリケーションです。バックエンドの計算エンジンとして OpenFOAM v2506 を使用し、植生キャノピーモデル（`canopyModels_v2506`）により樹木の気流・熱への影響を再現します。

本システムの構成や仕様の詳細については以下も参考にしてください。

- [技術検証レポート](https://www.mlit.go.jp/plateau/file/libraries/doc/*****)
- [PLATEAU Use case「樹木データを活用した温熱環境シミュレータの開発」](https://www.mlit.go.jp/plateau/use-case/uc24-17/)

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

## （1）データベースの準備

[PostgreSQL](https://github.com/postgres/postgres) を使ってPostgreSQLサーバを起動します。その上で、位置情報を扱うための拡張機能である [PostGIS](https://github.com/postgis/postgis) をインストールします。

```sql
-- PostGIS の有効化
CREATE EXTENSION IF NOT EXISTS postgis;
```

## （2）Webサーバの準備

[Apache HTTP Server](https://httpd.apache.org/) を使ってWebサーバを起動します。ビルド済みのフロントエンド資材を配信するためのドキュメントルートを設定してください。

## （3）Node.js の準備

フロントエンドのビルドには Node.js が必要です。[Node.js 公式サイト](https://nodejs.org/)より、LTS版（v20以上）をインストールしてください。

```bash
# バージョン確認
node -v   # v20.x.x 以上であることを確認
npm -v
```

## （4）Firebase プロジェクトの準備

1. [Firebase コンソール](https://console.firebase.google.com/)で新規プロジェクトを作成します。
2. **Authentication** を有効化し、**メール/パスワード** 認証プロバイダを有効にします。
3. プロジェクトの設定画面から以下の値を控えます。

| 環境変数名 | 説明 |
| --- | --- |
| `VITE_FIREBASE_API_KEY` | Firebase API キー |
| `VITE_FIREBASE_AUTH_DOMAIN` | Firebase Auth ドメイン |
| `VITE_FIREBASE_PROJECT_ID` | Firebase プロジェクト ID |
| `VITE_FIREBASE_STORAGE_BUCKET` | Firebase Storage バケット |
| `VITE_FIREBASE_APP_ID` | Firebase アプリ ID |
| `VITE_FIREBASE_MEASUREMENT_ID` | Firebase 計測 ID |

## （5）Cesium ion の準備

3D都市モデル（3DTiles）を配信するために [Cesium ion](https://cesium.com/platform/cesium-ion/) のアカウントを取得し、以下の手順を実施します。

1. Cesium ion にサインインし、3D都市モデルデータ（建物・樹木等）をアップロードします。
2. タイル変換処理が完了したら、アセットIDとアクセストークンを控えます。

## （6）OpenFOAM のインストール

シミュレーション計算サーバ（Linux 64bit）に OpenFOAM v2506 をインストールします。インストール手順は公式サイトを参照してください。

[https://www.openfoam.com/news/main-news/openfoam-v2506](https://www.openfoam.com/news/main-news/openfoam-v2506)

インストール後、OpenFOAM の環境変数を読み込みます。

```bash
source /usr/lib/openfoam/openfoam2506/etc/bashrc
```

インストール先によってパスは異なります。`foamVersion` コマンドでバージョンを確認してください。

```bash
foamVersion   # OpenFOAM-v2506 と表示されることを確認
```

# 4 インストール手順

## （1）リポジトリの取得

[こちら](https://github.com/Project-PLATEAU/green-thermal-simulation) から温熱環境シミュレーション機能のソースコードをクローンします。

```bash
git clone https://github.com/Project-PLATEAU/green-thermal-simulation.git
cd green-thermal-simulation
```

## （2）環境変数の設定

プロジェクトルート直下に `.env` ファイルを作成し、以下の環境変数を設定します。

```dotenv
# アプリケーション名（任意）
VITE_APP_NAME=thermal_env

# バックエンドAPIのエンドポイント
VITE_API_ENDPOINT=https://<サーバのホスト名またはIPアドレス>/api

# Firebase 認証情報（3事前準備（4）で控えた値を設定）
VITE_FIREBASE_API_KEY=<FirebaseのapiKey>
VITE_FIREBASE_AUTH_DOMAIN=<FirebaseのauthDomain>
VITE_FIREBASE_PROJECT_ID=<FirebaseのprojectId>
VITE_FIREBASE_STORAGE_BUCKET=<FirebaseのstorageBucket>
VITE_FIREBASE_APP_ID=<FirebaseのappId>
VITE_FIREBASE_MEASUREMENT_ID=<FirebaseのmeasurementId>

# Cesium ion アクセストークン（3事前準備（5）で控えた値を設定）
VITE_CESIUM_ION_TOKEN=<Cesium ionのアクセストークン>

# Cesium ion アセットID（建物・樹木等の3DTilesアセットID）
VITE_CESIUM_ASSET_ID=<アセットID>

# データ暗号化キー（任意。設定するとAPIリクエストデータを暗号化）
# VITE_ENCRYPTION_KEY=<任意の文字列>
```

## （3）依存ライブラリのインストール

```bash
npm install
```

`postinstall` スクリプトにより、以下の処理が自動的に実行されます。

- `src/resources` を `public/resources` へコピー
- `node_modules/cesium/Build/Cesium` を `src/cesium` および `public/cesium` へコピー

## （4）ビルド（本番環境）

```bash
npm run build
```

ビルド成果物は `dist` ディレクトリに出力されます。

## （5）Webサーバへの配置

`dist` ディレクトリの内容を、3（2）で準備したWebサーバのドキュメントルートに配置します。

```bash
# 例：Apache のドキュメントルートへコピー
cp -r dist/* /var/www/html/
```

SPA（シングルページアプリケーション）のため、すべてのリクエストを `index.html` にフォールバックするよう Apache の設定を行います。

```apache
<Directory /var/www/html>
    Options -Indexes
    AllowOverride All
</Directory>
```

`.htaccess` をドキュメントルートに配置します。

```apache
<IfModule mod_rewrite.c>
    RewriteEngine On
    RewriteBase /
    RewriteRule ^index\.html$ - [L]
    RewriteCond %{REQUEST_FILENAME} !-f
    RewriteCond %{REQUEST_FILENAME} !-d
    RewriteRule . /index.html [L]
</IfModule>
```

## （6）開発サーバの起動（開発時のみ）

本番環境へのデプロイではなく、ローカル開発環境での動作確認を行う場合は以下のコマンドを実行します。

```bash
npm run dev
```

デフォルトでは `http://localhost:5173` でアプリケーションが起動します。開発モードでは自動的にデバッグモード（`--mode=debug`）が有効になります。

# 5 OpenFOAM 植生キャノピーモデルの構築

本システムのシミュレーション計算には、OpenFOAM 標準ソルバー `buoyantBoussinesqSimpleFoam`（浮力を考慮した非圧縮性定常 RANS 計算）に、植生キャノピーモデル（`canopyModels_v2506`）を追加した環境が必要です。キャノピーモデルは運動量・温度・乱流エネルギー・乱流エネルギー消散率の各方程式に樹木（植生）の影響を表すソース項を加えるライブラリです。

OpenFOAM 計算サーバ（Linux 64bit）で以下の手順を実施してください。

## （1）キャノピーモデルのコンパイル

リポジトリに同梱されている `canopyModels_v2506_tar.gz` を展開し、OpenFOAM の wmake でコンパイルします。

```bash
# OpenFOAM 環境の読み込み（インストール先に応じてパスを変更）
source /usr/lib/openfoam/openfoam2506/etc/bashrc

# アーカイブの展開
tar xzf canopyModels_v2506_tar.gz
cd canopyModels_v2506

# クリーンビルド
wclean
wmake -libso
```

コンパイルが成功すると、`$FOAM_USER_LIBBIN/libpreFlowModels.so` が生成されます。

コンパイルされるソースの構成は以下のとおりです。

| ソースファイル | 内容 |
| --- | --- |
| `fvOptions/atmPlantCanopyKSourceB` | 乱流エネルギー k のソース項（B案） |
| `fvOptions/atmPlantCanopyTurbSourceB` | 乱流エネルギー消散率 ε のソース項（B案） |
| `fvOptions/atmPlantCanopyKSourceD` | 乱流エネルギー k のソース項（D案） |
| `fvOptions/atmPlantCanopyTurbSourceD` | 乱流エネルギー消散率 ε のソース項（D案） |

## （2）計算ケースへのライブラリの組み込み

計算ケースの `case/system/controlDict` に以下の1行を追加してライブラリを読み込みます。

```c++
libs ("libpreFlowModels.so");
```

## （3）fvOptions による計算条件の設定

計算ケースの `case/constant/fvOptions` に植生キャノピーモデルのソース項を設定します。各ソース項の役割と主なパラメータは以下のとおりです。

```c++
atmPlantCanopyUSource1   // 運動量式 U へのソース項
{
    type        atmPlantCanopyUSource;
    selectionMode all;
}

atmPlantCanopyTSource1   // エネルギー式（温度 T）へのソース項
{
    type        atmPlantCanopyTSource;
    selectionMode all;
    Cp0         1005.0;   // 比熱 [J/(kg·K)]
}

atmPlantCanopyTurbSource1  // 乱流エネルギー消散率 ε へのソース項
{
    type        atmPlantCanopyTurbSourceB;
    selectionMode all;
    rho         rho;
    Cpe1        1.95;     // モデル係数（標準値 1.5〜1.8）
}

atmPlantCanopyKSource1   // 乱流エネルギー k へのソース項
{
    type        atmPlantCanopyKSourceB;
    selectionMode all;
    rho         rho;
}
```

各ソース項で使用される主なモデルパラメータは以下のとおりです。

| パラメータ | 記号 | 単位 | 説明 |
| --- | --- | --- | --- |
| 葉面積密度 | LAD | 1/m | 単位体積あたりの葉面積 |
| 植生抵抗係数 | Cd | - | 樹木キャノピー抵抗係数 |
| 比熱 | Cp0 | J/(kg·K) | 空気の比熱（標準値：1005.0） |
| 樹高ベース熱流束 | qh | W/m² | 樹高に基づく単位面積あたりの熱流束 |
| モデル係数 | Cpe1 | - | ε ソース項のモデル係数（標準値：1.95） |

## （4）シミュレーションの実行

### シングルコア実行

```bash
buoyantBoussinesqSimpleFoam | tee log
```

### 並列実行（例：8コア）

```bash
decomposePar
mpirun -np 8 buoyantBoussinesqSimpleFoam -parallel | tee log
reconstructPar
```

1回のシミュレーション実行には数時間程度を要します。計算完了後、バックエンドAPIが結果を読み取り、フロントエンドのレポート画面に反映します。

# 6 バックエンドAPIの構築

本システムのフロントエンドは、バックエンドAPIと連携して動作します。バックエンドAPIはPostgreSQLデータベースに接続し、シミュレーションプロジェクトの管理およびOpenFOAM計算処理のトリガーを担います。

## （1）データベースの作成

PostgreSQLに接続し、本システム用のデータベースを作成します。

```sql
CREATE DATABASE green_thermal_simulation ENCODING 'UTF8';
\c green_thermal_simulation
CREATE EXTENSION IF NOT EXISTS postgis;
```

## （2）テーブルの作成

シミュレーションプロジェクトの主要なデータ項目は以下のとおりです。バックエンドAPIの実装に合わせてテーブルを作成してください。

| 属性項目 | フィールド名 | データ型 | 備考 |
| --- | --- | --- | --- |
| 内部ID | id | integer | 主キー |
| プロジェクトUID | uid | text | ユニーク識別子 |
| プロジェクト名 | name | text | |
| 解析対象領域 | the_geom | geometry(Polygon, 4326) | PostGIS。ユーザが地図上で指定したポリゴン |
| 気温 (°C) | temperature | float | |
| 湿度 (%) | humidity | float | |
| 風速 (m/s) | wind_speed | float | |
| 風向き (度) | wind_direction | integer | 0:北 / 90:東 / 180:南 / 270:西 |
| ビル壁面温度 (°C) | building_wall_temperature | float | |
| 地面温度 (°C) | ground_temperature | float | |
| 道路温度 (°C) | road_temperature | float | |
| 水面温度 (°C) | water_surface_temperature | float | |
| カメラ位置 | camera_position | jsonb | Cesiumビューアのカメラ位置・姿勢 |
| 処理ステータス | process_status | text | waiting / processing / done |
| 処理開始日時 | process_start_at | text | |
| 処理終了日時 | process_end_at | text | |
| 作成日時 | created_at | text | |
| 作成日時 (UNIX) | created_at_unix | bigint | |
| 更新日時 | updated_at | text | |
| 更新日時 (UNIX) | updated_at_unix | bigint | |
| 作成ユーザUID | created_user_uid | text | |

シミュレーション結果（地面温度・高さ1.2m気温・高さ1.2m湿度・WBGT等）を格納するテーブルについては、バックエンドAPIの仕様に合わせて追加のテーブルを作成してください。

## （3）APIエンドポイント

フロントエンドが利用する主要なAPIエンドポイントは以下のとおりです。

| エンドポイント | メソッド | 説明 |
| --- | --- | --- |
| `system/env` | GET | システム環境設定の取得 |
| `system/column_defs` | GET | 列定義情報の取得 |
| `user` | GET | ログインユーザ情報の取得 |
| `thermal_env` | GET | シミュレーションプロジェクト一覧の取得 |
| `thermal_env` | POST | シミュレーションプロジェクトの新規作成 |
| `thermal_env` | PUT | シミュレーションプロジェクトの更新 |
| `thermal_env/process` | PUT | OpenFOAM シミュレーション実行のリクエスト |

# 7 初期データの投入

本システムの稼働に必要なデータを投入します。

## （1）3D都市モデルデータの登録（Cesium ion）

3D都市モデル（建物モデル・樹木モデル等）を Cesium ion にアップロードし、配信の準備を行います。

1. Cesium ion の管理コンソールにアクセスします。
2. 対象データ（CityGML、3DTiles等）をアップロードし、タイル変換処理を実行します。
3. 生成されたアセットIDを控え、`.env` の `VITE_CESIUM_ASSET_ID` に反映します。

## （2）ユーザの登録

本システムはFirebase Authentication でユーザ認証を行います。初期ユーザの登録はバックエンドAPI のユーザ管理機能、またはFirebase コンソールから実施してください。

ユーザには以下の権限を付与できます。

| 権限 | 内容 |
| --- | --- |
| Web:Read | Webアプリへのログイン（閲覧のみ） |
| Web:Write | Webアプリへのログイン（編集可能） |
| App:Read | モバイルアプリへのログイン（閲覧のみ） |
| App:Write | モバイルアプリへのログイン（編集可能） |
| Data:Export | データのエクスポート権限 |
| User:Admin | ユーザ管理権限 |

# 8 動作確認

## （1）ブラウザからのアクセス

WebサーバのURLにブラウザからアクセスし、ログイン画面が表示されることを確認します。

```
https://<サーバのホスト名またはIPアドレス>/
```

## （2）ログイン確認

7（2）で登録したユーザのメールアドレスとパスワードでログインできることを確認します。

## （3）プロジェクト作成・地図表示の確認

ログイン後、プロジェクト一覧画面が表示されることを確認します。新規プロジェクトを作成し、地図上でシミュレーション対象領域をポリゴンで指定できることを確認します。

## （4）シミュレーション実行の確認

プロジェクト設定画面にて、以下の環境条件を入力してシミュレーション実行ボタンが押下できることを確認します。

- 環境設定：気温・湿度・風速・風向き
- 温度設定（表面）：ビル壁面温度・地面温度・道路温度・水面温度

シミュレーション実行後、処理ステータスが「処理中」に変わることを確認してください。バックエンドAPIが `thermal_env/process` エンドポイントを受け取り、OpenFOAM の `buoyantBoussinesqSimpleFoam` ソルバーが起動することを計算ログ（`log` ファイル）で確認します。

処理完了（「完了」ステータス）後に、以下の結果タブが表示されることを確認します。

- 地面温度
- 高さ1.2m 気温
- 高さ1.2m 湿度
- WBGT（暑さ指数）
- 3Dビュー（Cesium）
