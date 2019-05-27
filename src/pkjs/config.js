module.exports = [
  {
    "type": "heading",
    "defaultValue": "What 3 Words"
  },
  {
    "type": "text",
    "defaultValue": "<p>Feel free to contribute at the <a href=\"https://github.com/JavierRizzoA/Pebble-What3Words\">github repo</a>.</p>"
  },
  {
    "type": "section",
    "items": [
      {
        "type": "heading",
        "defaultValue": "Weather"
      },
      {
        "type": "toggle",
        "label": "Show Weather",
        "defaultValue": false,
        "messageKey": "ShowWeather"
      },
      {
        "type": "input",
        "label": "OpenWeatherMap API Key",
        "messageKey": "WeatherKey"
      },
      {
        "type": "radiogroup",
        "label": "Units",
        "defaultValue": "metric",
        "messageKey": "Unit",
        "options": [
          {
            "label": "Metric",
            "value": "metric"
          },
          {
            "label": "Imperial",
            "value": "imperial"
          }
        ]
      }
    ]
  },
  {
    "type": "submit",
    "defaultValue": "Save"
  }
];
