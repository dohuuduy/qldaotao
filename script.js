
// FILE: script.js

// THAY THE URL NAY BANG URL WEB APP DA TRIEN KHAI CUA BAN (KET THUC BANG /exec)
const API_URL = "https://script.google.com/macros/s/AKfycbzu-viGotjHtufdGyaGrpgyRFaSBpZ0GVWUirGOGQC063NQm1QwKch-V3J6hGfJSiyLIw/exec"; 

const modalKhoaHocInstance = new bootstrap.Modal(document.getElementById('modalKhoaHoc'));
const toastInstance = new bootstrap.Toast(document.getElementById('liveToast'));
let dangChinhSuaKhoaHoc = false;
let maKhoaHocDangSua = null;

document.addEventListener('DOMContentLoaded', function() {
    taiDanhSachKhoaHoc();

    document.getElementById('btnMoModalThemKhoaHoc').addEventListener('click', moModalThemKhoaHoc);
    document.getElementById('btnLuuKhoaHoc').addEventListener('click', luuKhoaHoc);

    // Kich hoat tooltip (neu co)
    var tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'))
    tooltipTriggerList.map(function (tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl)
    });
});

function hienThiToast(tieuDe, noiDung, loaiThongBao = 'info') {
    document.getElementById('toastTieuDe').textContent = tieuDe;
    document.getElementById('toastNoiDung').textContent = noiDung;
    const toastHeader = document.querySelector('#liveToast .toast-header');
    toastHeader.classList.remove('bg-success', 'text-white', 'bg-danger', 'text-white', 'bg-warning', 'text-dark', 'bg-info', 'text-white');
    switch (loaiThongBao) {
        case 'success': toastHeader.classList.add('bg-success', 'text-white'); break;
        case 'error': toastHeader.classList.add('bg-danger', 'text-white'); break;
        case 'warning': toastHeader.classList.add('bg-warning', 'text-dark'); break;
        case 'info': default: toastHeader.classList.add('bg-info', 'text-white'); break;
    }
    toastInstance.show();
}

function xuLyLoiAPI(error) {
    console.error('API Error:', error);
    hienThiToast('Lỗi API', error.message || 'Có lỗi xảy ra khi gọi API.', 'error');
}

// --- MODULE: DANH MUC KHOA HOC (Frontend) ---
function moModalThemKhoaHoc() {
    dangChinhSuaKhoaHoc = false;
    maKhoaHocDangSua = null;
    document.getElementById('formKhoaHoc').reset();
    document.getElementById('modalKhoaHocLabel').textContent = 'Thêm Khóa Đào tạo Mới';
    document.getElementById('maKhoaHoc').disabled = false;
    modalKhoaHocInstance.show();
}

async function moModalSuaKhoaHoc(maKhoaHoc) {
    console.log("Requesting details for maKhoaHoc:", maKhoaHoc);
    try {
        const response = await fetch(`${API_URL}?action=layChiTietKhoaHoc&maKhoaHoc=${encodeURIComponent(maKhoaHoc)}`);
        const result = await response.json();
        console.log("Response from layChiTietKhoaHoc:", result);

        if (result.success && result.data) {
            const khoaHoc = result.data;
            dangChinhSuaKhoaHoc = true;
            maKhoaHocDangSua = khoaHoc.maKhoaHoc;
            document.getElementById('formKhoaHoc').reset();
            document.getElementById('modalKhoaHocLabel').textContent = 'Chỉnh sửa Khóa Đào tạo';
            
            document.getElementById('maKhoaHocAn').value = khoaHoc.maKhoaHoc; // Van giu input an neu can
            document.getElementById('maKhoaHoc').value = khoaHoc.maKhoaHoc;
            document.getElementById('maKhoaHoc').disabled = true;
            document.getElementById('tenKhoaHoc').value = khoaHoc.tenKhoaHoc;
            document.getElementById('noiDungChinh').value = khoaHoc.noiDungChinh || '';
            document.getElementById('thoiLuong').value = khoaHoc.thoiLuong || '';
            document.getElementById('donViThoiLuong').value = khoaHoc.donViThoiLuong || 'Gio';
            document.getElementById('hinhThucDaoTao').value = khoaHoc.hinhThucDaoTao || 'Offline';
            // ... (dien cac truong khac tu khoaHoc. ...)

            modalKhoaHocInstance.show();
        } else {
            hienThiToast('Lỗi', result.message || 'Không tìm thấy thông tin khóa học.', 'error');
        }
    } catch (error) {
        xuLyLoiAPI(error);
    }
}

async function luuKhoaHoc() {
    const khoaHocData = {
        maKhoaHoc: document.getElementById('maKhoaHoc').value.trim(),
        tenKhoaHoc: document.getElementById('tenKhoaHoc').value.trim(),
        noiDungChinh: document.getElementById('noiDungChinh').value.trim(),
        thoiLuong: document.getElementById('thoiLuong').value,
        donViThoiLuong: document.getElementById('donViThoiLuong').value,
        hinhThucDaoTao: document.getElementById('hinhThucDaoTao').value,
        // ... (lay cac truong khac)
    };

    if (!khoaHocData.tenKhoaHoc) {
        hienThiToast('Lỗi', 'Tên khóa học không được để trống.', 'error');
        return;
    }

    let payload;
    if (dangChinhSuaKhoaHoc && maKhoaHocDangSua) {
        khoaHocData.maKhoaHoc = maKhoaHocDangSua; // Dam bao maKhoaHoc dung khi cap nhat
        payload = {
            action: 'capNhatKhoaHoc',
            duLieu: khoaHocData
        };
    } else {
        payload = {
            action: 'themKhoaHoc',
            duLieu: khoaHocData
        };
    }

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            // Headers: khong can thiet cho Apps Script neu khong co xac thuc phuc tap
            body: JSON.stringify(payload) 
            // Apps Script se tu dong parse JSON neu Content-Type la application/json
            // Tuy nhien, Apps Script mac dinh nhan POST body la string, nen server se parse
        });
        const result = await response.json();

        if (result.success || result.thanhCong) { // Server co the tra ve success hoac thanhCong
            hienThiToast('Thành công', result.message || result.thongBao || (dangChinhSuaKhoaHoc ? "Cập nhật thành công!" : "Thêm mới thành công!"), 'success');
            modalKhoaHocInstance.hide();
            taiDanhSachKhoaHoc();
        } else {
            hienThiToast('Lỗi', result.message || result.thongBao || 'Có lỗi xảy ra từ server.', 'error');
        }
    } catch (error) {
        xuLyLoiAPI(error);
    }
}


async function taiDanhSachKhoaHoc() {
    const tbody = document.getElementById('bangDanhSachKhoaHoc');
    tbody.innerHTML = '<tr><td colspan="6" class="text-center"><div class="spinner-border spinner-border-sm"></div> Đang tải...</td></tr>';
    try {
        const response = await fetch(`${API_URL}?action=layDanhSachKhoaHoc`);
        const result = await response.json();

        if (result.success && result.data) {
            hienThiDanhSachKhoaHoc(result.data);
        } else {
            tbody.innerHTML = `<tr><td colspan="6" class="text-center">${result.message || 'Không tải được dữ liệu.'}</td></tr>`;
            hienThiToast('Lỗi', result.message || 'Không tải được danh sách khóa học.', 'error');
        }
    } catch (error) {
        tbody.innerHTML = '<tr><td colspan="6" class="text-center">Lỗi khi tải dữ liệu.</td></tr>';
        xuLyLoiAPI(error);
    }
}

function hienThiDanhSachKhoaHoc(danhSachMang) {
    const tbody = document.getElementById('bangDanhSachKhoaHoc');
    tbody.innerHTML = '';
    if (!danhSachMang || danhSachMang.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="text-center">Không có dữ liệu khóa học.</td></tr>';
        return;
    }
    danhSachMang.forEach(khoaHoc => {
        const tr = document.createElement('tr');
        let donViThoiLuongDisplay = khoaHoc.donViThoiLuong || '';
        if (donViThoiLuongDisplay.toLowerCase() === 'gio') donViThoiLuongDisplay = 'Giờ';
        else if (donViThoiLuongDisplay.toLowerCase() === 'ngay') donViThoiLuongDisplay = 'Ngày';
        else if (donViThoiLuongDisplay.toLowerCase() === 'buoi') donViThoiLuongDisplay = 'Buổi';
        
        tr.innerHTML = `
            <td>${khoaHoc.maKhoaHoc || ''}</td>
            <td>${khoaHoc.tenKhoaHoc || ''}</td>
            <td>${khoaHoc.thoiLuong || ''} ${donViThoiLuongDisplay}</td>
            <td>${khoaHoc.hinhThucDaoTao || ''}</td>
            <td>
                <button class="btn btn-sm btn-outline-primary me-1" onclick='moModalSuaKhoaHoc("${khoaHoc.maKhoaHoc}")' title="Sửa"><i class="fas fa-edit"></i></button>
                <button class="btn btn-sm btn-outline-danger" onclick='xacNhanXoaKhoaHocAPI("${khoaHoc.maKhoaHoc}", "${khoaHoc.tenKhoaHoc}")' title="Xóa"><i class="fas fa-trash"></i></button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

function xacNhanXoaKhoaHocAPI(maKhoaHoc, tenKhoaHoc) {
    // Su dung confirm cua trinh duyet cho don gian, ban co the thay bang modal
    if (confirm(`Bạn có chắc chắn muốn xóa khóa học "${tenKhoaHoc}" (Mã: ${maKhoaHoc}) không?`)) {
        thucHienXoaKhoaHocAPI(maKhoaHoc, tenKhoaHoc);
    }
}

async function thucHienXoaKhoaHocAPI(maKhoaHoc, tenKhoaHoc) {
    const payload = {
        action: 'xoaKhoaHoc',
        maKhoaHoc: maKhoaHoc
    };
    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            body: JSON.stringify(payload)
        });
        const result = await response.json();
        if (result.success || result.thanhCong) {
            hienThiToast('Thành công', result.message || result.thongBao || `Đã xóa khóa học "${tenKhoaHoc}".`, 'success');
            taiDanhSachKhoaHoc();
        } else {
            hienThiToast('Lỗi', result.message || result.thongBao || 'Xóa khóa học thất bại.', 'error');
        }
    } catch (error) {
        xuLyLoiAPI(error);
    }
}

// Them cac ham xu ly cho cac module khac tuong tu...
// Vi du: taiDanhSachPhongBanAPI, luuPhongBanAPI, ...
