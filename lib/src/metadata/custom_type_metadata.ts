import TypeSerializer from '../type_serializer';
import Provider from '../types/provider';
import GenericMetadata from './generic_metadata';

/** Metadata container for custom serializable type */
export default class CustomTypeMetadata extends GenericMetadata {

    public static readonly kind = Symbol.for('com.github.teq.serialazy.customTypeMetadata');

    public readonly kind: typeof CustomTypeMetadata.kind = CustomTypeMetadata.kind;

    private typeSerializerProvider: Provider<TypeSerializer<any, any>> = null;

    public getTypeSerializer(): TypeSerializer<any, any> {

        return this.typeSerializerProvider && this.typeSerializerProvider();

    }

    /** Set type serializer on a custom type metadata */
    public setTypeSerializer(typeSerializer: TypeSerializer<any, any> | Provider<TypeSerializer<any, any>>) {

        if (this.typeSerializerProvider) {
            throw new Error(`Unable to re-define custom type serializer for "${this.name}"`);
        }

        this.typeSerializerProvider = typeof(typeSerializer) === 'function' ? typeSerializer : () => typeSerializer;

    }

}