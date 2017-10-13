import Constructable from './constructable';
import SerializationError from './errors/serialization_error';
import { JsonMap } from './json_type';
import Metadata from './metadata';

namespace Serializer {

    /**
     * Serialize to JSON-compatible object
     * @param serializable Serializable object
     * @returns JSON-compatible object which can be safely passed to `JSON.serialize`
     */
    export function toJsonObject(serializable: any): JsonMap {
        const proto = Object.getPrototypeOf(serializable);
        if (!proto || !Metadata.getFor(proto)) {
            throw new SerializationError("Provided object doesn't seem to be serializable. Hint: use `serialize` decorator to mark properties for serialization");
        }
        const meta = Metadata.getFor(proto);
        const jsonObj: JsonMap = {};
        meta.props.forEach((serializer, name) => {
            const value = serializer.down(serializable[name]);
            if (value !== undefined) {
                jsonObj[name] = value;
            }
        });
        return jsonObj;
    }

    /**
     * Construct class instance from JSON-compatible object
     * @param ctor Class instance constructor
     * @param jsonObj JSON-compatible object (e.g. returned from `JSON.parse`)
     * @returns Serializable class instance
     */
    export function fromJsonObject<T>(ctor: Constructable<T>, jsonObj: JsonMap): T {
        const meta = Metadata.getFor(ctor.prototype);
        if (!meta) {
            throw new SerializationError("Provided constructor function doesn't seem to be of serializable type. Hint: use `serialize` decorator to mark properties for serialization");
        }
        const classInstance = new ctor();
        meta.props.forEach((serializer, name) => {
            const value = serializer.up(jsonObj[name]);
            if (value !== undefined) {
                (classInstance as any)[name] = value;
            }
        });
        return classInstance;
    }

}

export default Serializer;
