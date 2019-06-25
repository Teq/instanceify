import chai = require('chai');

import { deflate, inflate, Serializable, Serialize } from 'serialazy';

const { expect } = chai;

describe('custom type serializer', () => {

    @Serializable({
        down: (val: Point) => `(${val.x},${val.y})`,
        up: (val) => {
            const match = val.match(/^\((\d+),(\d+)\)$/);
            if (!match) { throw new Error(`Invalid point: ${val}`); }
            const [, xStr, yStr] = match;
            return Object.assign(new Point(), { x: Number.parseInt(xStr), y: Number.parseInt(yStr) });
        }
    })
    class Point {
        public x: number;
        public y: number;
    }

    it('is able to serialize a type instance', () => {
        const point = Object.assign(new Point(), { x: 2, y: 3 });
        const serialized = deflate(point);
        expect(serialized).to.equal('(2,3)');
    });

    it('is able to deserialize a type instance', () => {
        const point = inflate('(4,5)', Point);
        expect(point).to.be.instanceOf(Point);
        expect(point).to.deep.equal({ x: 4, y: 5 });
    });

    it('should fail to apply on a class which has property serializers', () => {
        expect(() => {
            @Serializable({ down: null, up: null })
            class Test {
                @Serialize() public prop: string;
            }
        }).to.throw('Can\'t define a custom type serializer on a "property bag" serializable');
    });

    it('should fail to apply on a class which inherits from another serializable', () => {
        // TODO: allow it?
        expect(() => {
            @Serializable({ down: (val: TaggedPoint) => `(${val.x},${val.y}),${val.tag}` })
            class TaggedPoint extends Point {
                public tag: string;
            }
        }).to.throw('Can\'t define a custom serializer on type which inherits from another serializable');
    });

    it('can be re-defined', () => {

        Serializable({
            down: (val: Point) => [val.x, val.y]
        })(Point);

        const point = Object.assign(new Point(), { x: 2, y: 3 });
        const serialized = deflate(point);
        expect(serialized).to.deep.equal([2, 3]);

    });

});
