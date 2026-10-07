export const appointmentsData = [
  { id: 1, name: 'Mr. Arnie Armada', date: '2026-03-21', time: '7:00am - 7:30am', status: 'Approved', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Arnie' },
  { id: 2, name: 'Mr. Kenneth Bautista', date: '2026-04-06', time: '8:00am - 8:30am', status: 'Pending', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Kenneth' },
  { id: 3, name: 'Mr. Kenneth Bautista', date: '2026-04-08', time: '9:30am - 10:00am', status: 'Pending', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Kenneth' },
  { id: 4, name: 'Mr. Ramiro Martinez', date: '2026-03-17', time: '7:00am - 7:30am', status: 'Cancelled', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ramiro' },
  { id: 5, name: 'Ms. Cherryl Azucenas', date: '2026-04-06', time: '2:00pm - 2:15pm', status: 'Cancelled', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Cherryl' },
  { id: 6, name: 'Mr. Loudel Manaloto', date: '2026-04-01', time: '10:00am - 10:30am', status: 'Completed', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Loudel' },
  { id: 7, name: 'Mr. Reynaldo Bautista Jr.', date: '2026-03-25', time: '3:00pm - 3:30pm', status: 'Completed', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Reynaldo' },
  { id: 8, name: 'Mr. Arnie Armada', date: '2026-03-10', time: '8:00am - 8:30am', status: 'Completed', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Arnie' },
];

export const getCounts = () => {
  return {
    All: appointmentsData.length,
    Approved: appointmentsData.filter(a => a.status === 'Approved').length,
    Pending: appointmentsData.filter(a => a.status === 'Pending').length,
    Cancelled: appointmentsData.filter(a => a.status === 'Cancelled').length,
    Completed: appointmentsData.filter(a => a.status === 'Completed').length,
  };
};
