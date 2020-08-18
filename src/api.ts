import { Typing } from "@saggitarius/typing";
import { Buffer } from "@saggitarius/buffer";
import { Mode } from "./driver";

export enum Type {
    File,
    Directory,
}

export interface IReadableFile {
    readonly type: Type.File;
    readonly readable: true;
    readonly path: string;

    read(length?: number): Promise<Buffer>;
    close(): Promise<void>;
}

export interface IWritableFile {
    readonly type: Type.File;
    readonly writable: true;
    readonly readable: boolean;
    readonly path: string;

    write(data: string): Promise<void>;
    write(buffer: Buffer): Promise<void>;
    remove(): Promise<void>;
    close(): Promise<void>;
}


export type IFile = IReadableFile & IWritableFile;

export interface IReadableDirectory {
    readonly type: Type.Directory;
    readonly readable: true;
    readonly writable: boolean;
    readonly path: string;

    directory(name: string): Promise<IDirectory>;
    file(name: string, mode: Mode.Read): Promise<IFile>;
    close(): Promise<void>;
}

export interface IWritableDirectory {
    readonly type: Type.Directory;
    readonly writable: true;
    readonly path: string;

    directory(name: string): Promise<IDirectory>;
    file(name: string, mode: Mode): Promise<IFile>;
    // file(name: string, mode: Mode.Read): Promise<IFile>;
    // file(name: string, mode: Mode.Write): Promise<IFile>;
    // file(name: string, mode: Mode.ReadWrite): Promise<IFile>;
    // file(name: string, mode: Mode.ReadWriteCreate): Promise<IFile>;
    // file(name: string, mode: Mode.Append): Promise<IFile>;
    // file(name: string, mode: Mode.AppendCreate): Promise<IFile>;
    mkdir(name: string): Promise<void>;
    remove(): Promise<void>;
    close(): Promise<void>;
}

export interface IListableDirectory {
    readonly type: Type.Directory;
    readonly listable: true;
    readonly path: string;
    list(): AsyncIterable<[Type, string]>;
    files(): AsyncIterable<string>;
    directories(): AsyncIterable<string>;
    close(): Promise<void>;
}

export type IDirectory = IReadableDirectory & IWritableDirectory & IListableDirectory;

export interface IFileSystem {
    directory(path: string): Promise<IDirectory>;
    file(path: string, mode: Mode): Promise<IFile>;
}
export namespace IFileSystem {
    export const Type = Typing.type<IFileSystem>("@saggitarius/filesystem::IFileSystem");
}

// export function isWritable(file: IFile): file is IWritableFile;
// export function isWritable(dir: IDirectory): dir is IWritableDirectory;
// export function isWritable(file: IFile|IDirectory): boolean {
//     return file["writable"];
// }

// export function isReadable(file: IFile): file is IReadableFile;
// export function isReadable(dir: IDirectory): dir is IReadableDirectory;
// export function isReadable(file: IFile|IDirectory): boolean {
//     return file["readable"];
// }

// export function isListable(dir: IDirectory): dir is IListableDirectory {
//     return dir["listable"];
// }


