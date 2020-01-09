import {v4 as randUUID} from 'uuid';
const uuid = require('uuid/v5');
const namespace = uuid(window.location.hostname, uuid.DNS);
export {namespace, uuid, randUUID};