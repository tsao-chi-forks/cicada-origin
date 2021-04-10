import { LibraryConfig } from "../library"

// NOTE This interface is to abstract away:
// - the `base_dir` of `LocalLibrary`
// - the `base_url` of `RemoteLibrary`
// - the `base_repo` of `GitLabLibrary`

export interface Library {
  config: LibraryConfig
}
