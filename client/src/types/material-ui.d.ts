declare module '@mui/material' {
  export * from '@mui/material/index';
}

declare module '@mui/icons-material/Edit' {
  import { SvgIconProps } from '@mui/material/SvgIcon';
  const EditIcon: React.ComponentType<SvgIconProps>;
  export default EditIcon;
}

declare module '@mui/icons-material/Delete' {
  import { SvgIconProps } from '@mui/material/SvgIcon';
  const DeleteIcon: React.ComponentType<SvgIconProps>;
  export default DeleteIcon;
} 