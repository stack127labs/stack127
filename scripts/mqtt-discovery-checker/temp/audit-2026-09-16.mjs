import {checkMqttDiscovery as run, DEFAULT_MQTT_INPUT as defaults} from '../../../lib/mqtt-discovery-checker/engine.ts';
const cases=[
 ['missing sensor state',{payload:'{"name":"Temperature"}'}],
 ['bad common type',{payload:'{"name":"x","state_topic":"a","qos":99,"device":{"name":"Device","identifiers":[123]}}'}],
 ['bad topic id',{topic:'homeassistant/sensor/bad id/config'}],
 ['empty node id',{topic:'homeassistant/sensor//demo/config'}],
 ['abbreviated identity',{payload:'{"uniq_id":"demo","stat_t":"lab/temp"}'}],
 ['device identifier string',{payload:'{"name":"x","state_topic":"a","unique_id":"x","device":{"name":"Device","identifiers":"device-1"}}'}],
 ['number precision',{payload:'{"name":"x","state_topic":"a","x_value":9007199254740993}'}]
];
for(const [name,input] of cases)console.log(JSON.stringify({name,input,result:run({...defaults,...input})}));
