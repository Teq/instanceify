import { SerializationOptions } from "./options";

/** Reporesents a generic property serializer */
interface PropertySerializer<TSerialized, TOriginal, TTag> {

    /** Identifies property in `serializable` */
    readonly propertyName: string;

    /** Identifies property in `serialized` */
    readonly propertyTag: TTag;

    /** Serializes target property from `serializable` and writes value to `serialized` */
    down(serializable: TOriginal, serialized: TSerialized, options?: SerializationOptions): void;

    /** Deserializes target property from `serialized` and writes value to `serializable` */
    up(serializable: TOriginal, serialized: TSerialized, options?: SerializationOptions): void;

}

export default PropertySerializer;
