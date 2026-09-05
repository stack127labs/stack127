# Local security cameras data workflow

The page reads a reviewed subset of the CC0 CCTV Camera Database. A record must list RTSP or ONVIF, cite a manufacturer source, and provide a product page with a photograph large enough to cache clearly.

```bash
node scripts/local-security-cameras/refresh-local-security-cameras.mjs <camera-database-checkout> <40-character-commit> <target-count>
```

The script prioritizes recorded Frigate configurations, ONVIF, PoE, and several established brands. It keeps tested and untested Frigate records distinct. Review stream paths and community notes because firmware can invalidate them.
