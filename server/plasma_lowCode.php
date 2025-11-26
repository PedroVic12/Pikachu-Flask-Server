<?php
$curl = curl_init();
curl_setopt($curl, CURLOPT_URL, "https://codegen.plasmic.app/api/v1/loader/html/preview/sASgw4mBYozi3FT7g73H8T/Homepage?hydrate=1&embedHydrate=1");
// Provide the project ID and public API token.
curl_setopt($curl, CURLOPT_HTTPHEADER, array(
  "x-plasmic-api-project-tokens: sASgw4mBYozi3FT7g73H8T:GSG2Rq5p04ZxxXLsdk5dVeypteYJm7LfXX3DVrAqYKbEknxAVwIGAZUFxFXyGFeRA8YVkIMAWbFj1UWgqga6A"
));
curl_setopt($curl, CURLOPT_RETURNTRANSFER, 1);
$response = curl_exec($curl);
curl_close($curl);

$result = json_decode($response);
echo $result->html;
?>