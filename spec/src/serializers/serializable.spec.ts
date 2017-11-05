import chai = require('chai');

import { deflate, inflate, Serialize } from '../../../.';

const { expect } = chai;

describe('default serializer for serializables (serializable objects)', () => {

    class Author {
        @Serialize() public name: string;
        public constructor(name?: string) {
            if (name !== undefined) { this.name = name; }
        }
    }

    class Book {
        @Serialize() public title: string;
        @Serialize() public author: Author;
        public constructor(title?: string, author?: Author) {
            if (title !== undefined) { this.title = title; }
            if (author !== undefined) { this.author = author; }
        }
    }

    describe('when a property is serializable', () => {

        const bookObj = {
            title: 'The Story of the Sealed Room',
            author: { name: 'Arthur Conan Doyle' }
        };

        const book = new Book('The Story of the Sealed Room', new Author('Arthur Conan Doyle'));

        it('serializes to JSON-compatible object', () => {
            const serialized = deflate(book);
            expect(serialized).to.deep.equal(bookObj);
        });

        it('deserializes from JSON-compatible object', () => {
            const deserialized = inflate(Book, bookObj);
            expect(deserialized instanceof Book).to.equal(true);
            expect(deserialized).to.deep.equal(book);
        });

    });

    describe('when a property is a non-serializable', () => {

        class NotSerializableAuthor {
            public name: string;
        }

        it('should fail to decorate it as serializable', () => {
            expect(() => {
                // tslint:disable-next-line:no-unused-variable
                class Book {
                    @Serialize() public author: NotSerializableAuthor;
                }
            }).to.throw('Unable to find serializer for type: "NotSerializableAuthor"');
        });

    });

    describe('when the value is null', () => {

        const bookObj = {
            title: 'War and Peace',
            author: null as any
        };

        describe('and property is not nullable (default behavior)', () => {

            it('should fail to serialize', () => {
                const entity = new Book('War and Peace', null);
                expect(() => deflate(entity)).to.throw('Unable to serialize property "author": Value is null');
            });

            it('should fail to deserialize', () => {
                expect(() => inflate(Book, bookObj)).to.throw('Unable to deserialize property "author": Value is null');
            });

        });

        describe('and property is nullable', () => {

            class Book {
                @Serialize() public title: string;
                @Serialize({ nullable: true }) public author: Author;
                public constructor(title?: string, author?: Author) {
                    if (title !== undefined) { this.title = title; }
                    if (author !== undefined) { this.author = author; }
                }
            }

            it('serializes to null', () => {
                const entity = new Book('War and Peace', null);
                const serialized = deflate(entity);
                expect(serialized).to.deep.equal(bookObj);
            });

            it('deserializes to null', () => {
                const deserialized = inflate(Book, bookObj);
                expect(deserialized instanceof Book).to.equal(true);
                expect(deserialized).to.deep.equal(bookObj);
            });

        });

    });

    describe('when the value is undefuned', () => {

        const bookObj = {
            title: 'The Little Prince',
            // author: undefined
        };

        describe('and property is not optional (default behavior)', () => {

            it('should fail to serialize', () => {
                const entity = new Book('The Little Prince', undefined);
                expect(() => deflate(entity)).to.throw('Unable to serialize property "author": Value is undefined');
            });

            it('should fail to deserialize', () => {
                expect(() => inflate(Book, bookObj)).to.throw('Unable to deserialize property "author": Value is undefined');
            });

        });

        describe('and property is optional', () => {

            class Book {
                @Serialize() public title: string;
                @Serialize({ optional: true }) public author: Author;
                public constructor(title?: string, author?: Author) {
                    if (title !== undefined) { this.title = title; }
                    if (author !== undefined) { this.author = author; }
                }
            }

            it('serializes to undefined', () => {
                const entity = new Book('The Little Prince', undefined);
                const serialized = deflate(entity);
                expect(serialized).to.deep.equal(bookObj);
            });

            it('deserializes to undefined', () => {
                const deserialized = inflate(Book, bookObj);
                expect(deserialized instanceof Book).to.equal(true);
                expect(deserialized).to.deep.equal(bookObj);
            });

        });

    });

});
