import Modal from '../ui/Modal';
import FilterPanel from './FilterPanel';

export default function FilterModal({ open, criteria, onChange, onReset, onClose }) {
  return (
    <Modal open={open} title="Bộ lọc bất động sản" onClose={onClose}>
      <FilterPanel criteria={criteria} onChange={onChange} onReset={onReset} compact />
    </Modal>
  );
}
