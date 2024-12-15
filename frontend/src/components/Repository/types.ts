export interface SnackbarState {
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'info' | 'warning';
  }
  
export type SortOption = 'name' | 'releaseDate' | 'addedDate' | 'status';
export type SortDirection = 'asc' | 'desc';
export type FilterOption = 'all' | 'seen' | 'unseen';
  