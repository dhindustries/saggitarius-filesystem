import { Buffer } from "@saggitarius/buffer";
import { Path } from "@saggitarius/path";
import * as api from "./api";
import { Mode, Driver, DirectoryDescriptor, FileDescriptor } from "./driver";

const WritableModes = [
    Mode.Append,
    Mode.AppendCreate,
    Mode.ReadWrite,
    Mode.ReadWriteCreate,
    Mode.Write,
];

const ReadableModes = [
    Mode.Read,
    Mode.ReadWrite,
    Mode.ReadWriteCreate,
    Mode.Append,
    Mode.AppendCreate,
];

class File {
    public readonly type = api.Type.File;
    public readonly readable: boolean;
    public readonly writable: boolean;

    public constructor(
        public readonly path: string,
        private readonly descriptor: FileDescriptor,
        private readonly driver: Driver,
        mode: Mode,
    ) {
        this.readable = ReadableModes.includes(mode);
        this.writable = WritableModes.includes(mode);
    }

    public read(length?: number): Promise<Buffer> {
        if (!this.readable) {
            throw new Error("file is not readable");
        }
        return this.driver.read(this.descriptor, length);
    }

    public write(buffer: any) {
        if (!this.writable) {
            throw new Error("file is not writable");
        }
        return this.driver.write(this.descriptor, buffer);
    }

    public close(): Promise<void> {
        return this.driver.close(this.descriptor);
    }

    public remove(): Promise<void> {
        if (!this.writable) {
            throw new Error("file is not writable");
        }
        return this.driver.remove(this.descriptor);
    }
}

class Directory {
    public readonly type = api.Type.Directory;

    public constructor(
        public readonly path: string,
        private readonly descriptor: DirectoryDescriptor,
        private readonly driver: Driver,
        public readonly readable: boolean,
        public readonly writable: boolean,
        public readonly listable: boolean,
    ) {}

    public async directory(name: string): Promise<api.IDirectory> {
        if (!this.readable) {
            throw new Error("directory is not readable");
        }
        const path = Path.join(this.path, name);
        const descriptor = await this.driver.opendir(path);

        return new Directory(path, descriptor, this.driver,
            this.readable, this.writable, this.listable) as api.IDirectory;
    }

    public async file(name: string, mode: Mode): Promise<api.IFile> {
        if (!this.readable && mode === Mode.Read) {
            return Promise.reject(new Error("file is not available for reading"));
        }
        if (!this.writable && WritableModes.includes(mode)) {
            return Promise.reject(new Error("file is not available for writing"));
        }
        const path = Path.join(this.path, name);
        const descriptor = await this.driver.openfile(path, mode);

        return new File(path, descriptor, this.driver, mode) as api.IFile;
    }

    public close(): Promise<void> {
        return this.driver.close(this.descriptor);
    }

    public mkdir(name: string): Promise<void> {
        if (!this.writable) {
            throw new Error("directory is not writable");
        }
        return this.driver.mkdir(name);
    }

    public remove(): Promise<void> {
        if (!this.writable) {
            throw new Error("directory is not writable");
        }
        return this.driver.remove(this.descriptor);
    }

    public async *list(): AsyncIterable<[api.Type, string]> {
        if (!this.listable) {
            throw new Error("directory is not listable");
        }
        for await (const elem of this.driver.list(this.descriptor)) {
            yield [elem.isDirectory ? api.Type.Directory : api.Type.File, elem.name];
        }
    }

    public async *files(): AsyncIterable<string> {
        if (!this.listable) {
            throw new Error("directory is not listable");
        }
        for await (const elem of this.driver.list(this.descriptor)) {
            if (elem.isFile) {
                yield elem.name;
            }
        }
    }

    public async *directories(): AsyncIterable<string> {
        if (!this.listable) {
            throw new Error("directory is not listable");
        }
        for await (const elem of this.driver.list(this.descriptor)) {
            if (elem.isDirectory) {
                yield elem.name;
            }
        }
    }
}

export class FileSystem implements api.IFileSystem {
    private root: Directory;

    public constructor(
        driver: Driver,
        root: string,
        readable: boolean,
        writable: boolean,
        listable: boolean,
    ) {
        this.root = new Directory(
            root,
            null,
            driver,
            readable,
            writable,
            listable,
        );
    }

    public directory(path: string): Promise<api.IDirectory> {
        return this.root.directory(path);
    }

    public file(path: string, mode: Mode): Promise<api.IFile> {
        return this.root.file(path, mode);
    }
}
