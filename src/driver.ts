import { Buffer } from "@saggitarius/buffer";


export interface FileDescriptor {

}

export interface DirectoryDescriptor {

}

export interface DirectoryEntry {
    readonly name: string;
    readonly isFile: boolean;
    readonly isDirectory: boolean;
}

export type Descriptor = FileDescriptor | DirectoryDescriptor;

export enum Mode {
    Read = "r",
    Write = "w",
    ReadWrite = "r+",
    ReadWriteCreate = "w+",
    Append = "a",
    AppendCreate = "a+",
}

export interface Stats {
    readonly isFile: boolean;
    readonly isDirectory: boolean;
    readonly size: number;
    readonly ctime: number;
    readonly atime: number;
}

export interface Driver {
    stat(path: string): Promise<Stats>;
    chmod(path: string, chmod: number): Promise<void>;
    chown(path: string, user: number, group: number): Promise<void>;
    close(fd: Descriptor): Promise<void>;
    remove(fd: Descriptor): Promise<void>;
    mkdir(path: string): Promise<void>;
    openfile(path: string, mode: Mode): Promise<FileDescriptor>;
    opendir(path: string): Promise<DirectoryDescriptor>;
    list(dd: DirectoryDescriptor): AsyncIterable<DirectoryEntry>;
    read(fd: FileDescriptor, length?: number): Promise<Buffer>;
    write(fd: FileDescriptor, buffer: Buffer): Promise<void>;
    rename(oldPath: string, newPath: string): Promise<void>;
    link(target: string, path: string): Promise<void>;
    symlink(target: string, path: string): Promise<void>;
    unlink(path: string): Promise<void>;
    realpath(path: string): Promise<void>;
}
