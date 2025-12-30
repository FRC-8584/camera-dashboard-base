# Dashboard Port/Endpoints
## WS

`ws://127.0.0.1:8080/ws`
> main.js 18:1 可以調整
> const WS_URL = "ws://127.0.0.1:8080/ws";
---

## To Backend
| Type     | 說明                               |
| -------- | -------------------------------- |
| `stream` | 影像串流設定（fps / resolution）         |
| `params` | Camera 參數（exposure / color / WB） |

### Examples
```
{
  "type": "stream",
  "data": {
    "fps": 30,
    "width": 1280,
    "height": 720,
    "resolution": "1280x720"
  }
}
```

```
{
  "type": "params",
  "data": {
    "exposure_ev": 0.0,
    "brightness": 50,
    "contrast": 50,
    "saturation": 50,
    "wb_auto": true,
    "wb_temperature": 5000
  }
}
```

---

## From Backend
| Type      | 說明                                 |
| --------- | ---------------------------------- |
| `image`   | Camera 影像畫面（Base64 image frame）    |
| `metrics` | 偵測結果與效能指標（tx / ty / fps / latency） |
| `log`     | 後端 Log 訊息                        |

### Examples

```
{
  "type": "image",
  "format": "jpeg",
  "data": "<base64-image-data>"
}
```

```
{
  "type": "metrics",
  "tx": 12.4,
  "ty": -3.7,
  "fps": 29.8,
  "latency_ms": 34
}
```

```
{
  "type": "log",
  "level": "info",
  "scope": "detector",
  "message": "object detected"
}
```