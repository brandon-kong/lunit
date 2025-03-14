interface ReplicatedStorage extends Instance {
    Tests: Folder & {
        client: Folder;
        server: Folder;
        shared: Folder;
    }
}