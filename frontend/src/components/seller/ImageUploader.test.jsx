import { describe, expect, it, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import ImageUploader from './ImageUploader';
import { postingService } from '../../services/postingService';

vi.mock('../../services/postingService', () => ({ postingService: { uploadImage: vi.fn(() => new Promise(() => {})) } }));
globalThis.URL.createObjectURL = vi.fn(() => 'blob:preview');

const pick = (container, files) => fireEvent.change(container.querySelector('input[type=file]'), { target: { files } });

describe('ImageUploader – kiểm tra ảnh trước khi tải lên', () => {
  it('từ chối file sai định dạng và file > 5 MB, không gọi API', () => {
    const onChange = vi.fn();
    const { container } = render(<ImageUploader images={[]} onChange={onChange} />);
    const big = new File([new Uint8Array(5 * 1024 * 1024 + 1)], 'big.jpg', { type: 'image/jpeg' });
    const gif = new File(['x'], 'a.gif', { type: 'image/gif' });

    pick(container, [big, gif]);

    expect(screen.getByRole('alert')).toHaveTextContent('big.jpg: lớn hơn 5 MB');
    expect(screen.getByRole('alert')).toHaveTextContent('a.gif: chỉ nhận JPG, PNG, WEBP');
    expect(postingService.uploadImage).not.toHaveBeenCalled();
    expect(onChange).not.toHaveBeenCalled();
  });

  it('ảnh hợp lệ được thêm và tải lên', () => {
    const onChange = vi.fn();
    const { container } = render(<ImageUploader images={[]} onChange={onChange} />);
    pick(container, [new File(['x'], 'ok.png', { type: 'image/png' })]);

    expect(onChange).toHaveBeenCalledWith([expect.objectContaining({ status: 'uploading', preview: 'blob:preview' })]);
    expect(postingService.uploadImage).toHaveBeenCalledTimes(1);
  });
});
