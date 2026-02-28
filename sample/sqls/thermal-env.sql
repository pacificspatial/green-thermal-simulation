
CREATE TABLE thermal_env (
    id INT NOT NULL, -- レコードunique id
    uid TEXT NOT NULL, -- 温熱環境unique id
    created_at TIMESTAMP, -- 作成日
    updated_at TIMESTAMP, -- 更新日
    created_user_uid TEXT, -- 作成ユーザID
    camera_position JSON, -- 最終カメラ位置
    edit_geojson TEXT, -- 樹木編集geojson
    name TEXT, -- プロジェクト名
    temperature NUMERIC, -- 気温
    humidity NUMERIC, -- 湿度
    wind_speed NUMERIC, -- 風速
    wind_direction NUMERIC, -- 風向
    building_wall_temperature NUMERIC, -- ビル壁面温度
    ground_temperature NUMERIC, -- 地面温度
    road_temperature NUMERIC, -- 道路温度
    water_surface_temperature NUMERIC, -- 水面温度
    process_start_at TIMESTAMP, -- シミュレーション処理開始日
    process_end_at TIMESTAMP, -- シミュレーション処理終了日
    process_status TEXT, -- シミュレーション処理ステータス
    temperature_ground TEXT, -- 地表温度
    temperature_120 TEXT, -- 120m高温度
    humidity_120 TEXT, -- 120m高湿度
    wbgt TEXT, -- WBGT
    cesium TEXT, -- Ceisum Ion Asset ID
    zip_url TEXT -- ダウンロード用zipファイルパス
);