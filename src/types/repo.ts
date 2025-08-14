export type Repo = {
    id: number,
    node_id: string,
    name: string,
    private: boolean,
    description: string | null,
    created_at: string,
    updated_at: string,
    pushed_at: string,
    clone_url: string,
    default_branch: string,
}