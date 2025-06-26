import Swal from 'sweetalert2';

const customSwal = Swal.mixin({
  customClass: {
    popup: 'swal-compact-popup',
    title: 'swal-compact-title',
    htmlContainer: 'swal-compact-html',
    confirmButton: 'swal-compact-confirm',
    cancelButton: 'swal-compact-cancel',
    icon: 'swal-compact-icon'
  },
  buttonsStyling: false
});

export default customSwal;