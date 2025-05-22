// FILE: script.js

// QUAN TRONG: THAY THE URL NAY BANG URL WEB APP DA TRIEN KHAI CUA BAN (KET THUC BANG /exec)
const API_URL = "https://script.google.com/macros/s/AKfycbz27L07uv71ddw0IOGgos5wPK_Yd4BlikwY5icS1H-LNcc6HNimFPsJLrNkTO5UIkuyEQ/exec"; 

// --- KHAI BAO BIEN TOAN CUC ---
const CAC_TRANG = document.querySelectorAll('.page-content');
const modalKhoaHocInstance = new bootstrap.Modal(document.getElementById('modalKhoaHoc'));
const modalPhongBanInstance = new bootstrap.Modal(document.getElementById('modalPhongBan')); 
const modalGiangVienInstance = new bootstrap.Modal(document.getElementById('modalGiangVien')); 
const modalDonViDaoTaoInstance = new bootstrap.Modal(document.getElementById('modalDonViDaoTao')); 
const modalXacNhanXoaInstance = new bootstrap.Modal(document.getElementById('modalXacNhanXoa')); 
const toastInstance = new bootstrap.Toast(document.getElementById('liveToast'));

let dangChinhSuaKhoaHoc = false;
let currentKhoaHocData = null; 
let dangChinhSuaPhongBan = false; 
let currentPhongBanData = null; 
let dangChinhSuaGiangVien = false; 
let currentGiangVienData = null; 
let dangChinhSuaDonViDaoTao = false; 
let currentDonViDaoTaoData = null; 
let danhSachNhanVienDaChonTamThoi = [];
let hamXuLyKhiXacNhanXoa = null; 

// --- KHOI TAO KHI TAI TRANG ---
document.addEventListener('DOMContentLoaded', function() {
    hienThiTrang('trangTongQuan'); 
    
    if (typeof bootstrap.Collapse === 'undefined') {
        console.error('Bootstrap Collapse component is not loaded or available!');
        hienThiToast('Lỗi nghiêm trọng', 'Thành phần giao diện chính (Collapse) không tải được.', 'error');
    }
    
    var tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'))
    tooltipTriggerList.map(function (tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl)
    });

    document.getElementById('btnXacNhanXoaTrongModal').addEventListener('click', function() {
        if (typeof hamXuLyKhiXacNhanXoa === 'function') {
            hamXuLyKhiXacNhanXoa();
        }
        modalXacNhanXoaInstance.hide();
    });

    // Gan su kien click cho cac nut mo modal va luu
    document.getElementById('btnMoModalThemKhoaHoc').addEventListener('click', moModalThemKhoaHoc);
    document.getElementById('btnLuuKhoaHoc').addEventListener('click', luuKhoaHoc);
    document.getElementById('btnMoModalThemPhongBan').addEventListener('click', moModalThemPhongBan);
    document.getElementById('btnLuuPhongBan').addEventListener('click', luuPhongBan);
    document.getElementById('btnMoModalThemGiangVien').addEventListener('click', moModalThemGiangVien);
    document.getElementById('btnLuuGiangVien').addEventListener('click', luuGiangVien);
    document.getElementById('btnMoModalThemDonViDaoTao').addEventListener('click', moModalThemDonViDaoTao);
    document.getElementById('btnLuuDonViDaoTao').addEventListener('click', luuDonViDaoTao);

    // Gan su kien click cho cac link dieu huong
    document.querySelectorAll('.navbar .nav-link[data-page], .sidebar .nav-link[data-page]').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            hienThiTrang(this.dataset.page);
        });
    });
    document.getElementById('sidebarToggler').addEventListener('click', toggleSidebar);
    document.getElementById('btnDangXuat').addEventListener('click', xuLyDangXuat);


    // Khoi tao Select2 cho cac modal khi chung duoc hien thi
     $('#modalKhoaHoc').on('shown.bs.modal', function () {
        const select2Options = { theme: "bootstrap-5", dropdownParent: $(this), width: '100%' };
        if (!$('#maDonViToChucNoiBo').data('select2')) { $('#maDonViToChucNoiBo').select2(select2Options); }
        if (!$('#maDonViDaoTaoNgoai').data('select2')) { $('#maDonViDaoTaoNgoai').select2(select2Options); }
        if (!$('#maGiangVienChinh').data('select2')) { $('#maGiangVienChinh').select2(select2Options); }
        
        if (dangChinhSuaKhoaHoc && currentKhoaHocData) {
            $('#maDonViToChucNoiBo').val(currentKhoaHocData.maDonViToChucNoiBo || '').trigger('change');
            $('#maDonViDaoTaoNgoai').val(currentKhoaHocData.maDonViDaoTaoNgoai || '').trigger('change');
            $('#maGiangVienChinh').val(currentKhoaHocData.maGiangVienChinh || '').trigger('change');
        }
    });
    $('#modalPhongBan').on('shown.bs.modal', function () {
         if (!$('#maPhongBanCha').data('select2')) {
            $('#maPhongBanCha').select2({ theme: "bootstrap-5", dropdownParent: $(this), width: '100%' });
         }
         if (dangChinhSuaPhongBan && currentPhongBanData) {
            $('#maPhongBanCha').val(currentPhongBanData.maPhongBanCha || "").trigger('change');
         }
    });
     $('#modalGiangVien').on('shown.bs.modal', function () {
        const select2OptionsGV = { theme: "bootstrap-5", dropdownParent: $(this), width: '100%' };
        if (!$('#maNhanVienGV').data('select2')) { $('#maNhanVienGV').select2(select2OptionsGV); }
        if (!$('#maDonViDaoTaoGV').data('select2')) { $('#maDonViDaoTaoGV').select2(select2OptionsGV); }

        if (dangChinhSuaGiangVien && currentGiangVienData) {
            $('#maNhanVienGV').val(currentGiangVienData.maNhanVienGV || "").trigger('change');
            $('#maDonViDaoTaoGV').val(currentGiangVienData.maDonViDaoTao || "").trigger('change');
        }
    });
    
});

// --- HAM XU LY GIAO DIEN CHUNG (TIEN ICH) ---
function hienThiTrang(idTrang) {
    CAC_TRANG.forEach(trang => {
        trang.style.display = 'none';
    });
    const trangCanHienThi = document.getElementById(idTrang);
    if (trangCanHienThi) {
        trangCanHienThi.style.display = 'block';
    } else {
        console.error("Khong tim thay trang voi ID: ", idTrang);
        document.getElementById('trangTongQuan').style.display = 'block'; 
    }

    document.querySelectorAll('.navbar .nav-link').forEach(link => {
        link.classList.remove('active');
    });
    const activeNavbarLink = document.querySelector(`.navbar .nav-link[data-page="${idTrang}"]`);
    if (activeNavbarLink) {
        activeNavbarLink.classList.add('active');
    }

    document.querySelectorAll('.sidebar .nav-link').forEach(link => {
        link.classList.remove('active-sidebar'); 
    });

    const activeSidebarLink = document.querySelector(`.sidebar .nav-link[data-page="${idTrang}"]`);
    if (activeSidebarLink) {
        activeSidebarLink.classList.add('active-sidebar'); 

        const parentCollapseDiv = activeSidebarLink.closest('.collapse'); 
        if (parentCollapseDiv) { 
            const parentTriggerLink = document.querySelector(`a[data-bs-target="#${parentCollapseDiv.id}"]`);
            if (parentTriggerLink) {
                parentTriggerLink.classList.add('active-sidebar'); 
                var bsCollapse = bootstrap.Collapse.getInstance(parentCollapseDiv);
                if (!bsCollapse) { 
                    bsCollapse = new bootstrap.Collapse(parentCollapseDiv, {toggle: false});
                }
                if (bsCollapse && !parentCollapseDiv.classList.contains('show')) { 
                    bsCollapse.show();
                } else if (!bsCollapse) {
                     console.error("Khong the khoi tao Bootstrap Collapse cho: ", parentCollapseDiv.id);
                }
            }
        }
    }

    // Tai du lieu cho trang cu the khi chuyen trang
    if (idTrang === 'trangDanhMucKhoaHoc') {
        taiDanhSachKhoaHoc();
        taiDuLieuChoSelectsFormKhoaHoc();
    } else if (idTrang === 'trangDanhMucPhongBan') {
        taiDanhSachPhongBan();
        taiDanhSachPhongBanChaChoSelect(); 
    } else if (idTrang === 'trangDanhMucGiangVien') {
        taiDanhSachGiangVien();
        taiDuLieuChoSelectsFormGiangVien();
    } else if (idTrang === 'trangDanhMucDonViDaoTao') {
        taiDanhSachDonViDaoTao();
    }
     else if (idTrang === 'trangChonNhanVienDaoTao') {
        taiKhoaHocVaoSelectChonNhanVien();
        taiPhongBanVaoFilterChonNhanVien();
        danhSachNhanVienDaChonTamThoi = []; 
        capNhatDanhSachNhanVienDaChonUI();
        document.getElementById('bangDanhSachNhanVienDeChon').innerHTML = '<tr><td colspan="5" class="text-center">Vui lòng chọn khóa học và áp dụng bộ lọc.</td></tr>';
    }
}

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

function capNhatTenNguoiDung(nguoiDung) {
    if (nguoiDung && nguoiDung.email) {
        document.getElementById('tenNguoiDung').textContent = nguoiDung.ten || nguoiDung.email;
    } else {
        document.getElementById('tenNguoiDung').textContent = "Khách";
    }
}

function xuLyDangXuat() {
    hienThiToast('Thông báo', 'Chức năng đăng xuất sẽ được xử lý sau khi có cơ chế xác thực API.', 'info');
}

function toggleSidebar() {
    document.getElementById('appSidebar').classList.toggle('active');
}

function xuLyLoiAPI(error, context = "") { 
     console.error(`Lỗi API ${context}: `, error);
    const message = error.message || 'Lỗi không xác định từ server.';
    hienThiToast(`Lỗi API ${context}`, 'Có lỗi xảy ra: ' + message, 'error');
}

// --- MODULE: DANH MUC KHOA HOC ---
function moModalThemKhoaHoc() {
    dangChinhSuaKhoaHoc = false;
    currentKhoaHocData = null;
    document.getElementById('formKhoaHoc').reset();
    document.getElementById('maKhoaHocAn').value = '';
    document.getElementById('modalKhoaHocLabel').textContent = 'Thêm Khóa Đào tạo Mới';
    document.getElementById('maKhoaHoc').disabled = false;
    taiDuLieuChoSelectsFormKhoaHoc(true); 
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
            currentKhoaHocData = khoaHoc; 
            document.getElementById('formKhoaHoc').reset();
            document.getElementById('modalKhoaHocLabel').textContent = 'Chỉnh sửa Khóa Đào tạo';
            
            document.getElementById('maKhoaHocAn').value = khoaHoc.maKhoaHoc; 
            document.getElementById('maKhoaHoc').value = khoaHoc.maKhoaHoc;
            document.getElementById('maKhoaHoc').disabled = true;
            document.getElementById('tenKhoaHoc').value = khoaHoc.tenKhoaHoc;
            document.getElementById('noiDungChinh').value = khoaHoc.noiDungChinh || '';
            document.getElementById('thoiLuong').value = khoaHoc.thoiLuong || '';
            document.getElementById('donViThoiLuong').value = khoaHoc.donViThoiLuong || 'Gio'; 
            document.getElementById('chiPhiDuKien').value = khoaHoc.chiPhiDuKien || '';
            document.getElementById('donViTienTe').value = khoaHoc.donViTienTe || 'VND';
            document.getElementById('hinhThucDaoTao').value = khoaHoc.hinhThucDaoTao || 'Offline';
            document.getElementById('trangThaiKhoaHoc').value = khoaHoc.trangThaiKhoaHoc || 'Đang hoạt động';
            
            await taiDuLieuChoSelectsFormKhoaHoc(true); 
            
            document.getElementById('taiLieuLienQuan').value = khoaHoc.taiLieuLienQuan || '';
            document.getElementById('mucTieuKhoaHoc').value = khoaHoc.mucTieuKhoaHoc || '';
            document.getElementById('doiTuongPhuHop').value = khoaHoc.doiTuongPhuHop || '';
            document.getElementById('ghiChuKhoaHoc').value = khoaHoc.ghiChu || '';
            modalKhoaHocInstance.show(); 
        } else {
            hienThiToast('Lỗi', result.message || 'Không tìm thấy thông tin khóa học.', 'error');
        }
    } catch (error) {
        xuLyLoiAPI(error, "moModalSuaKhoaHoc");
    }
}

async function luuKhoaHoc() {
    const khoaHocData = {
        maKhoaHoc: document.getElementById('maKhoaHoc').value.trim(),
        tenKhoaHoc: document.getElementById('tenKhoaHoc').value.trim(),
        noiDungChinh: document.getElementById('noiDungChinh').value.trim(),
        thoiLuong: document.getElementById('thoiLuong').value,
        donViThoiLuong: document.getElementById('donViThoiLuong').value, 
        chiPhiDuKien: document.getElementById('chiPhiDuKien').value,
        donViTienTe: document.getElementById('donViTienTe').value,
        hinhThucDaoTao: document.getElementById('hinhThucDaoTao').value,
        maDonViToChucNoiBo: $('#maDonViToChucNoiBo').val(), 
        maDonViDaoTaoNgoai: $('#maDonViDaoTaoNgoai').val(),
        maGiangVienChinh: $('#maGiangVienChinh').val(), 
        taiLieuLienQuan: document.getElementById('taiLieuLienQuan').value.trim(),
        mucTieuKhoaHoc: document.getElementById('mucTieuKhoaHoc').value.trim(),
        doiTuongPhuHop: document.getElementById('doiTuongPhuHop').value.trim(),
        trangThaiKhoaHoc: document.getElementById('trangThaiKhoaHoc').value,
        ghiChu: document.getElementById('ghiChuKhoaHoc').value.trim()
    };

    if (!khoaHocData.tenKhoaHoc) {
        hienThiToast('Lỗi', 'Tên khóa học không được để trống.', 'error');
        return;
    }

    let payload;
    if (dangChinhSuaKhoaHoc) {
        khoaHocData.maKhoaHoc = document.getElementById('maKhoaHocAn').value; 
        payload = { action: 'capNhatKhoaHoc', duLieu: khoaHocData };
    } else {
        payload = { action: 'themKhoaHoc', duLieu: khoaHocData };
    }

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            body: JSON.stringify(payload)
        });
        const result = await response.json();

        if (result.success || result.thanhCong) { 
            hienThiToast('Thành công', result.message || result.thongBao || (dangChinhSuaKhoaHoc ? "Cập nhật thành công!" : "Thêm mới thành công!"), 'success');
            modalKhoaHocInstance.hide();
            taiDanhSachKhoaHoc();
        } else {
            hienThiToast('Lỗi', result.message || result.thongBao || 'Có lỗi xảy ra từ server.', 'error');
        }
    } catch (error) {
        xuLyLoiAPI(error, "luuKhoaHoc");
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
        xuLyLoiAPI(error, "taiDanhSachKhoaHoc");
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

        let tooltipContent = '';
        if (khoaHoc.tenGiangVienChinh) {
            tooltipContent += `<b>Giảng viên:</b> ${khoaHoc.tenGiangVienChinh}<br>`;
        }
        let donViToChucDisplay = '';
        if (khoaHoc.tenDonViToChucNoiBo) {
            donViToChucDisplay = khoaHoc.tenDonViToChucNoiBo + " (Nội bộ)";
        } else if (khoaHoc.tenDonViDaoTaoNgoai) {
            donViToChucDisplay = khoaHoc.tenDonViDaoTaoNgoai + " (Ngoài)";
        }
        if (donViToChucDisplay) {
             tooltipContent += `<b>Đơn vị tổ chức:</b> ${donViToChucDisplay}<br>`;
        }
        if (khoaHoc.hinhThucDaoTao) {
             tooltipContent += `<b>Hình thức:</b> ${khoaHoc.hinhThucDaoTao}`;
        }
        
        tr.innerHTML = `
            <td><span class="ma-khoa-hoc-rut-gon" data-bs-toggle="tooltip" title="${khoaHoc.maKhoaHoc || ''}">${khoaHoc.maKhoaHoc || ''}</span></td>
            <td><span class="ten-khoa-hoc-tooltip" data-bs-toggle="tooltip" data-bs-html="true" title="${tooltipContent.replace(/"/g, '&quot;')}">${khoaHoc.tenKhoaHoc || ''}</span></td>
            <td>${khoaHoc.thoiLuong || ''} ${donViThoiLuongDisplay}</td>
            <td>${khoaHoc.hinhThucDaoTao || ''}</td>
            <td>${khoaHoc.chiPhiDuKien ? new Intl.NumberFormat('vi-VN').format(khoaHoc.chiPhiDuKien) + ' ' + (khoaHoc.donViTienTe || 'VND') : ''}</td>
            <td>
                <button class="btn btn-sm btn-outline-primary me-1" onclick='moModalSuaKhoaHoc("${khoaHoc.maKhoaHoc}")' title="Sửa"><i class="fas fa-edit"></i></button>
                <button class="btn btn-sm btn-outline-danger" onclick='xacNhanXoaKhoaHocAPI("${khoaHoc.maKhoaHoc}", "${khoaHoc.tenKhoaHoc}")' title="Xóa"><i class="fas fa-trash"></i></button>
            </td>
        `;
        tbody.appendChild(tr);
    });
    var tooltipTriggerList = [].slice.call(tbody.querySelectorAll('[data-bs-toggle="tooltip"]'))
    tooltipTriggerList.map(function (tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl)
    });
}
        
function xacNhanXoaKhoaHocAPI(maKhoaHoc, tenKhoaHoc) {
    document.getElementById('thongTinXoaModal').textContent = `Khóa học: ${tenKhoaHoc} (Mã: ${maKhoaHoc})`;
    hamXuLyKhiXacNhanXoa = function() {
        thucHienXoaKhoaHocAPI(maKhoaHoc, tenKhoaHoc);
    };
    modalXacNhanXoaInstance.show();
}

async function thucHienXoaKhoaHocAPI(maKhoaHoc, tenKhoaHoc) {
    const payload = { action: 'xoaKhoaHoc', maKhoaHoc: maKhoaHoc };
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
        xuLyLoiAPI(error, "thucHienXoaKhoaHocAPI");
    }
}

async function taiDuLieuChoSelectsFormKhoaHoc(resetOptions = false, callback) {
    let loadedCount = 0;
    const totalSelects = 3;
    
    const populateSelect = async (selectId, placeholder, actionName, valueField, textField, additionalTextFn) => {
        try {
            const response = await fetch(`${API_URL}?action=${actionName}`);
            const result = await response.json();
            const select = $(`#${selectId}`);
            const currentValue = select.val();
            select.empty().append(new Option(placeholder, ''));
            if (result.success && result.data) {
                result.data.forEach(item => {
                    let text = item[textField];
                    if (additionalTextFn) text += additionalTextFn(item);
                    select.append(new Option(text, item[valueField]));
                });
            }
            if (resetOptions || !select.find(`option[value="${currentValue}"]`).length) {
                select.val("").trigger('change');
            } else {
                select.val(currentValue).trigger('change');
            }
        } catch (error) {
            xuLyLoiAPI(error, `taiDuLieuChoSelects (${selectId})`);
        } finally {
            loadedCount++;
            if (loadedCount === totalSelects && callback) {
                callback();
            }
        }
    };

    populateSelect('maDonViToChucNoiBo', 'Chọn phòng ban', 'layDanhSachPhongBan', 'maPhongBan', 'tenPhongBan');
    populateSelect('maDonViDaoTaoNgoai', 'Chọn đơn vị đào tạo', 'layDanhSachDonViDaoTao', 'maDonViDaoTao', 'tenDonViDaoTao');
    populateSelect('maGiangVienChinh', 'Chọn giảng viên', 'layDanhSachGiangVien', 'maGiangVien', 'hoTenGV', item => ` (${item.loaiGiangVien || 'N/A'})`);
}

// --- MODULE: DANH MUC PHONG BAN ---
function moModalThemPhongBan() {
    dangChinhSuaPhongBan = false;
    currentPhongBanData = null;
    document.getElementById('formPhongBan').reset();
    document.getElementById('maPhongBanAn').value = '';
    document.getElementById('modalPhongBanLabel').textContent = 'Thêm Phòng Ban Mới';
    document.getElementById('maPhongBan').disabled = false;
    taiDanhSachPhongBanChaChoSelect(true); 
    modalPhongBanInstance.show();
}

async function moModalSuaPhongBan(phongBanDuLieu) {
    dangChinhSuaPhongBan = true;
    currentPhongBanData = phongBanDuLieu;
    document.getElementById('formPhongBan').reset();
    document.getElementById('modalPhongBanLabel').textContent = 'Chỉnh sửa Phòng Ban';

    document.getElementById('maPhongBanAn').value = phongBanDuLieu.maPhongBan;
    document.getElementById('maPhongBan').value = phongBanDuLieu.maPhongBan;
    document.getElementById('maPhongBan').disabled = true;
    document.getElementById('tenPhongBan').value = phongBanDuLieu.tenPhongBan;
    document.getElementById('emailPhongBan').value = phongBanDuLieu.emailPhongBan || "";
    document.getElementById('soDienThoaiPhongBan').value = phongBanDuLieu.soDienThoaiPhongBan || "";
    document.getElementById('moTaPhongBan').value = phongBanDuLieu.moTa || "";
    
    await taiDanhSachPhongBanChaChoSelect(true); 
    modalPhongBanInstance.show();
}

async function luuPhongBan() {
    const phongBanData = {
        maPhongBan: document.getElementById('maPhongBan').value.trim(),
        tenPhongBan: document.getElementById('tenPhongBan').value.trim(),
        maPhongBanCha: $('#maPhongBanCha').val(),
        emailPhongBan: document.getElementById('emailPhongBan').value.trim(),
        soDienThoaiPhongBan: document.getElementById('soDienThoaiPhongBan').value.trim(),
        moTa: document.getElementById('moTaPhongBan').value.trim()
    };

    if (!phongBanData.tenPhongBan) {
        hienThiToast('Lỗi', 'Tên phòng ban không được để trống.', 'error'); return;
    }

    let payload;
    if (dangChinhSuaPhongBan) {
        phongBanData.maPhongBan = document.getElementById('maPhongBanAn').value; 
        payload = { action: 'capNhatPhongBan', duLieu: phongBanData };
    } else {
        payload = { action: 'themPhongBan', duLieu: phongBanData };
    }

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            body: JSON.stringify(payload)
        });
        const result = await response.json();
        if (result.success || result.thanhCong) {
            hienThiToast('Thành công', result.message || result.thongBao || (dangChinhSuaPhongBan ? "Cập nhật thành công!" : "Thêm mới thành công!"), 'success');
            modalPhongBanInstance.hide();
            taiDanhSachPhongBan(); 
            taiDanhSachPhongBanChaChoSelect(true); 
        } else {
            hienThiToast('Lỗi', result.message || result.thongBao || 'Có lỗi xảy ra.', 'error');
        }
    } catch (error) {
        xuLyLoiAPI(error, "luuPhongBan");
    }
}

async function taiDanhSachPhongBan() {
    const tbody = document.getElementById('bangDanhSachPhongBan');
    tbody.innerHTML = '<tr><td colspan="5" class="text-center"><div class="spinner-border spinner-border-sm"></div> Đang tải...</td></tr>';
    try {
        const response = await fetch(`${API_URL}?action=layDanhSachPhongBanDayDu`);
        const result = await response.json();
        if (result.success && result.data) {
            hienThiDanhSachPhongBan(result.data);
        } else {
             tbody.innerHTML = `<tr><td colspan="5" class="text-center">${result.message || 'Không tải được dữ liệu.'}</td></tr>`;
            hienThiToast('Lỗi', result.message || 'Không tải được danh sách phòng ban.', 'error');
        }
    } catch (error) {
        tbody.innerHTML = '<tr><td colspan="5" class="text-center">Lỗi khi tải dữ liệu.</td></tr>';
        xuLyLoiAPI(error, "taiDanhSachPhongBan");
    }
}

function hienThiDanhSachPhongBan(danhSachPhongBan) {
    const tbody = document.getElementById('bangDanhSachPhongBan');
    tbody.innerHTML = '';
    if (!danhSachPhongBan || danhSachPhongBan.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" class="text-center">Không có dữ liệu phòng ban.</td></tr>';
        return;
    }
    const phongBanMap = danhSachPhongBan.reduce((map, pb) => { map[pb.maPhongBan] = pb.tenPhongBan; return map; }, {});

    danhSachPhongBan.forEach(pb => {
        const tr = document.createElement('tr');
        const tenPhongBanCha = pb.maPhongBanCha ? (phongBanMap[pb.maPhongBanCha] || pb.maPhongBanCha) : 'Không có';
        tr.innerHTML = `
            <td>${pb.maPhongBan || ''}</td>
            <td>${pb.tenPhongBan || ''}</td>
            <td>${tenPhongBanCha}</td>
            <td>${pb.emailPhongBan || ''}</td>
            <td>
                <button class="btn btn-sm btn-outline-primary me-1" onclick='suaPhongBanAPI("${pb.maPhongBan}")' title="Sửa"><i class="fas fa-edit"></i></button>
                <button class="btn btn-sm btn-outline-danger" onclick='xacNhanXoaPhongBanAPI("${pb.maPhongBan}", "${pb.tenPhongBan}")' title="Xóa"><i class="fas fa-trash"></i></button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}
        
async function suaPhongBanAPI(maPhongBan) {
     try {
        const response = await fetch(`${API_URL}?action=layChiTietPhongBan&maPhongBan=${encodeURIComponent(maPhongBan)}`);
        const result = await response.json();
        if (result.success && result.data) {
            moModalSuaPhongBan(result.data);
        } else {
            hienThiToast('Lỗi', result.message || 'Không tìm thấy thông tin phòng ban.', 'error');
        }
    } catch (error) {
        xuLyLoiAPI(error, "suaPhongBanAPI");
    }
}

function xacNhanXoaPhongBanAPI(maPhongBan, tenPhongBan) {
    document.getElementById('thongTinXoaModal').textContent = `Phòng ban: ${tenPhongBan} (Mã: ${maPhongBan})`;
    hamXuLyKhiXacNhanXoa = function() {
        thucHienXoaPhongBanAPI(maPhongBan, tenPhongBan);
    };
    modalXacNhanXoaInstance.show();
}

async function thucHienXoaPhongBanAPI(maPhongBan, tenPhongBan) {
    const payload = { action: 'xoaPhongBan', maPhongBan: maPhongBan };
    try {
        const response = await fetch(API_URL, { method: 'POST', body: JSON.stringify(payload) });
        const result = await response.json();
        if (result.success || result.thanhCong) {
            hienThiToast('Thành công', result.message || result.thongBao || `Đã xóa phòng ban "${tenPhongBan}".`, 'success');
            taiDanhSachPhongBan();
            taiDanhSachPhongBanChaChoSelect(true); 
        } else {
            hienThiToast('Lỗi', result.message || result.thongBao || 'Xóa phòng ban thất bại.', 'error');
        }
    } catch (error) {
        xuLyLoiAPI(error, "thucHienXoaPhongBanAPI");
    }
}

async function taiDanhSachPhongBanChaChoSelect(resetOptions = false, callback) {
    try {
        const response = await fetch(`${API_URL}?action=layDanhSachPhongBan`);
        const result = await response.json();
        const select = $('#maPhongBanCha'); 
        const currentValue = select.val(); 
        select.empty().append(new Option('Không có', '')); 
        if (result.success && result.data) {
            result.data.forEach(item => {
                select.append(new Option(item.tenPhongBan, item.maPhongBan));
            });
        }
        
        if (select.data('select2')) { 
            select.trigger('change.select2'); 
        } else {
            select.select2({ theme: "bootstrap-5", dropdownParent: $('#modalPhongBan'), width: '100%' });
        }
        
        if (currentValue && select.find(`option[value="${currentValue}"]`).length && !resetOptions) {
             select.val(currentValue).trigger('change');
        } else {
             select.val("").trigger('change');
        }

        if(callback) callback();
    } catch (error) {
        xuLyLoiAPI(error, "taiDanhSachPhongBanChaChoSelect");
        if(callback) callback();
    }
}

// --- MODULE: DANH MUC GIANG VIEN ---
function moModalThemGiangVien() {
    dangChinhSuaGiangVien = false;
    currentGiangVienData = null;
    document.getElementById('formGiangVien').reset();
    document.getElementById('maGiangVienAn').value = '';
    document.getElementById('modalGiangVienLabel').textContent = 'Thêm Giảng Viên Mới';
    document.getElementById('maGiangVienModal').disabled = false;
    document.getElementById('loaiGiangVien').value = 'Nội bộ'; 
    toggleGiangVienFields(); 
    taiDuLieuChoSelectsFormGiangVien(true);
    modalGiangVienInstance.show();
}

async function moModalSuaGiangVien(giangVienDuLieu) {
    dangChinhSuaGiangVien = true;
    currentGiangVienData = giangVienDuLieu;
    document.getElementById('formGiangVien').reset();
    document.getElementById('modalGiangVienLabel').textContent = 'Chỉnh sửa Giảng Viên';

    document.getElementById('maGiangVienAn').value = giangVienDuLieu.maGiangVien;
    document.getElementById('maGiangVienModal').value = giangVienDuLieu.maGiangVien;
    document.getElementById('maGiangVienModal').disabled = true;
    document.getElementById('hoTenGV').value = giangVienDuLieu.hoTenGV;
    document.getElementById('loaiGiangVien').value = giangVienDuLieu.loaiGiangVien;
    toggleGiangVienFields(); 

    await taiDuLieuChoSelectsFormGiangVien(true); 
    
    document.getElementById('chiPhiThueTheoBuoiGV').value = giangVienDuLieu.chiPhiThueTheoBuoi || "";
    document.getElementById('chuyenMonChinhGV').value = giangVienDuLieu.chuyenMonChinh || "";
    document.getElementById('emailGV').value = giangVienDuLieu.emailGV || "";
    document.getElementById('soDienThoaiGV').value = giangVienDuLieu.soDienThoaiGV || "";
    document.getElementById('danhGiaGV').value = giangVienDuLieu.danhGiaGV || "";
    document.getElementById('kinhNghiemGV').value = giangVienDuLieu.kinhNghiem || "";
    document.getElementById('thongTinKhacGV').value = giangVienDuLieu.thongTinKhac || "";
    document.getElementById('ghiChuGV').value = giangVienDuLieu.ghiChu || "";
    
    modalGiangVienInstance.show();
}
        
function toggleGiangVienFields() {
    const loaiGV = document.getElementById('loaiGiangVien').value;
    const khuVucNoiBo = document.getElementById('khuVucGiangVienNoiBo');
    const khuVucThueNgoai = document.getElementById('khuVucGiangVienThueNgoai');

    if (loaiGV === 'Nội bộ') {
        khuVucNoiBo.style.display = 'block'; 
        khuVucThueNgoai.style.display = 'none';
    } else { 
        khuVucNoiBo.style.display = 'none';
        khuVucThueNgoai.style.display = 'block'; 
    }
}

async function taiDuLieuChoSelectsFormGiangVien(resetOptions = false, callback){
    let loadedCountGV = 0;
    const totalSelectsGV = 2;
    
    const populateSelectGV = async (selectId, placeholder, actionName, valueField, textField, additionalTextFn) => {
        try {
            const response = await fetch(`${API_URL}?action=${actionName}`);
            const result = await response.json();
            const select = $(`#${selectId}`);
            const currentValue = select.val();
            select.empty().append(new Option(placeholder, ''));
            if (result.success && result.data) {
                result.data.forEach(item => { 
                    let text = item[textField];
                    if(additionalTextFn) text = additionalTextFn(item);
                    select.append(new Option(text, item[valueField]));
                });
            }
            if (resetOptions || !select.find(`option[value="${currentValue}"]`).length) {
                select.val("").trigger('change');
            } else {
                select.val(currentValue).trigger('change');
            }
        } catch (error) {
            xuLyLoiAPI(error, `taiDuLieuSelectsGV (${selectId})`);
        } finally {
            loadedCountGV++;
            if(loadedCountGV === totalSelectsGV && callback) callback();
        }
    };
    
    populateSelectGV('maNhanVienGV', 'Chọn nhân viên', 'layDanhSachNhanVien', 'maNhanVien', 'hoTen', item => ` (${item.maNhanVien || 'N/A'})`);
    populateSelectGV('maDonViDaoTaoGV', 'Chọn đơn vị đào tạo', 'layDanhSachDonViDaoTao', 'maDonViDaoTao', 'tenDonViDaoTao');
}


async function luuGiangVien() {
    const giangVienData = {
        maGiangVien: document.getElementById('maGiangVienModal').value.trim(),
        hoTenGV: document.getElementById('hoTenGV').value.trim(),
        loaiGiangVien: document.getElementById('loaiGiangVien').value,
        maNhanVienGV: $('#maNhanVienGV').val(), 
        maDonViDaoTao: $('#maDonViDaoTaoGV').val(), 
        chiPhiThueTheoBuoi: document.getElementById('chiPhiThueTheoBuoiGV').value,
        chuyenMonChinh: document.getElementById('chuyenMonChinhGV').value.trim(),
        emailGV: document.getElementById('emailGV').value.trim(),
        soDienThoaiGV: document.getElementById('soDienThoaiGV').value.trim(),
        danhGiaGV: document.getElementById('danhGiaGV').value.trim(),
        kinhNghiem: document.getElementById('kinhNghiemGV').value.trim(),
        thongTinKhac: document.getElementById('thongTinKhacGV').value.trim(),
        ghiChu: document.getElementById('ghiChuGV').value.trim()
    };

    if (!giangVienData.hoTenGV) {
        hienThiToast('Lỗi', 'Họ tên giảng viên không được để trống.', 'error'); return;
    }
    if (!giangVienData.loaiGiangVien) {
        hienThiToast('Lỗi', 'Vui lòng chọn loại giảng viên.', 'error'); return;
    }
    
    if (giangVienData.loaiGiangVien === 'Thuê ngoài') {
        giangVienData.maNhanVienGV = ""; 
    } else {
        giangVienData.maDonViDaoTao = ""; 
        giangVienData.chiPhiThueTheoBuoi = "";
    }

    let payload;
    if (dangChinhSuaGiangVien) {
        giangVienData.maGiangVien = document.getElementById('maGiangVienAn').value; 
        payload = { action: 'capNhatGiangVien', duLieu: giangVienData };
    } else {
        payload = { action: 'themGiangVien', duLieu: giangVienData };
    }
     try {
        const response = await fetch(API_URL, { method: 'POST', body: JSON.stringify(payload) });
        const result = await response.json();
        if (result.success || result.thanhCong) {
            hienThiToast('Thành công', result.message || result.thongBao || (dangChinhSuaGiangVien ? "Cập nhật thành công!" : "Thêm mới thành công!"), 'success');
            modalGiangVienInstance.hide();
            taiDanhSachGiangVien(); 
        } else {
            hienThiToast('Lỗi', result.message || result.thongBao || 'Có lỗi xảy ra.', 'error');
        }
    } catch (error) {
        xuLyLoiAPI(error, "luuGiangVien");
    }
}

async function taiDanhSachGiangVien() {
    const tbody = document.getElementById('bangDanhSachGiangVien');
    tbody.innerHTML = '<tr><td colspan="7" class="text-center"><div class="spinner-border spinner-border-sm"></div> Đang tải...</td></tr>';
    try {
        const response = await fetch(`${API_URL}?action=layDanhSachGiangVienDayDu`);
        const result = await response.json();
        if (result.success && result.data) {
            hienThiDanhSachGiangVien(result.data);
        } else {
            tbody.innerHTML = `<tr><td colspan="7" class="text-center">${result.message || 'Không tải được dữ liệu.'}</td></tr>`;
            hienThiToast('Lỗi', result.message || 'Không tải được danh sách giảng viên.', 'error');
        }
    } catch (error) {
         tbody.innerHTML = '<tr><td colspan="7" class="text-center">Lỗi khi tải dữ liệu.</td></tr>';
        xuLyLoiAPI(error, "taiDanhSachGiangVien");
    }
}

function hienThiDanhSachGiangVien(danhSachGV) {
    const tbody = document.getElementById('bangDanhSachGiangVien');
    tbody.innerHTML = '';
    if (!danhSachGV || danhSachGV.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" class="text-center">Không có dữ liệu giảng viên.</td></tr>';
        return;
    }
    danhSachGV.forEach(gv => {
        const tr = document.createElement('tr');
        let donViDisplay = '';
        if (gv.loaiGiangVien === 'Nội bộ' && gv.tenNhanVienGV) { 
            donViDisplay = `NV: ${gv.tenNhanVienGV}`;
        } else if (gv.loaiGiangVien === 'Thuê ngoài' && gv.tenDonViDaoTaoGV) { 
            donViDisplay = `ĐV: ${gv.tenDonViDaoTaoGV}`;
        }

        tr.innerHTML = `
            <td>${gv.maGiangVien || ''}</td>
            <td>${gv.hoTenGV || ''}</td>
            <td>${gv.loaiGiangVien || ''}</td>
            <td>${gv.chuyenMonChinh || ''}</td>
            <td>${gv.emailGV || ''}</td>
            <td>${donViDisplay}</td>
            <td>
                <button class="btn btn-sm btn-outline-primary me-1" onclick='suaGiangVienAPI("${gv.maGiangVien}")' title="Sửa"><i class="fas fa-edit"></i></button>
                <button class="btn btn-sm btn-outline-danger" onclick='xacNhanXoaGiangVienAPI("${gv.maGiangVien}", "${gv.hoTenGV}")' title="Xóa"><i class="fas fa-trash"></i></button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

async function suaGiangVienAPI(maGiangVien) {
    try {
        const response = await fetch(`${API_URL}?action=layChiTietGiangVien&maGiangVien=${encodeURIComponent(maGiangVien)}`);
        const result = await response.json();
        if (result.success && result.data) {
            moModalSuaGiangVien(result.data);
        } else {
            hienThiToast('Lỗi', result.message || 'Không tìm thấy thông tin giảng viên.', 'error');
        }
    } catch (error) {
        xuLyLoiAPI(error, "suaGiangVienAPI");
    }
}

function xacNhanXoaGiangVienAPI(maGiangVien, hoTenGV) {
    document.getElementById('thongTinXoaModal').textContent = `Giảng viên: ${hoTenGV} (Mã: ${maGiangVien})`;
    hamXuLyKhiXacNhanXoa = function() {
        thucHienXoaGiangVienAPI(maGiangVien, hoTenGV);
    };
    modalXacNhanXoaInstance.show();
}

async function thucHienXoaGiangVienAPI(maGiangVien, hoTenGV) {
    const payload = { action: 'xoaGiangVien', maGiangVien: maGiangVien };
    try {
        const response = await fetch(API_URL, { method: 'POST', body: JSON.stringify(payload) });
        const result = await response.json();
        if (result.success || result.thanhCong) {
            hienThiToast('Thành công', result.message || result.thongBao || `Đã xóa giảng viên "${hoTenGV}".`, 'success');
            taiDanhSachGiangVien();
        } else {
            hienThiToast('Lỗi', result.message || result.thongBao || 'Xóa giảng viên thất bại.', 'error');
        }
    } catch (error) {
        xuLyLoiAPI(error, "thucHienXoaGiangVienAPI");
    }
}

// --- MODULE: DANH MUC DON VI DAO TAO ---
function moModalThemDonViDaoTao() {
    dangChinhSuaDonViDaoTao = false;
    currentDonViDaoTaoData = null;
    document.getElementById('formDonViDaoTao').reset();
    document.getElementById('maDonViDaoTaoAn').value = '';
    document.getElementById('modalDonViDaoTaoLabel').textContent = 'Thêm Đơn Vị Đào Tạo Mới';
    document.getElementById('maDonViDaoTaoModal').disabled = false;
    modalDonViDaoTaoInstance.show();
}

async function moModalSuaDonViDaoTao(dvdtDuLieu) {
    dangChinhSuaDonViDaoTao = true;
    currentDonViDaoTaoData = dvdtDuLieu;
    document.getElementById('formDonViDaoTao').reset();
    document.getElementById('modalDonViDaoTaoLabel').textContent = 'Chỉnh sửa Đơn Vị Đào Tạo';

    document.getElementById('maDonViDaoTaoAn').value = dvdtDuLieu.maDonViDaoTao;
    document.getElementById('maDonViDaoTaoModal').value = dvdtDuLieu.maDonViDaoTao;
    document.getElementById('maDonViDaoTaoModal').disabled = true;
    document.getElementById('tenDonViDaoTaoModal').value = dvdtDuLieu.tenDonViDaoTao;
    document.getElementById('diaChiDVDT').value = dvdtDuLieu.diaChi || "";
    document.getElementById('emailLienHeDVDT').value = dvdtDuLieu.emailLienHe || "";
    document.getElementById('soDienThoaiLienHeDVDT').value = dvdtDuLieu.soDienThoaiLienHe || "";
    document.getElementById('websiteDVDT').value = dvdtDuLieu.website || "";
    document.getElementById('nguoiDaiDienDVDT').value = dvdtDuLieu.nguoiDaiDien || "";
    document.getElementById('linhVucDaoTaoChinhDVDT').value = dvdtDuLieu.linhVucDaoTaoChinh || "";
    document.getElementById('danhGiaDonViDVDT').value = dvdtDuLieu.danhGiaDonVi || "";
    document.getElementById('ghiChuDVDT').value = dvdtDuLieu.ghiChu || "";
    
    modalDonViDaoTaoInstance.show();
}

async function luuDonViDaoTao() {
    const donViDaoTaoData = {
        maDonViDaoTao: document.getElementById('maDonViDaoTaoModal').value.trim(),
        tenDonViDaoTao: document.getElementById('tenDonViDaoTaoModal').value.trim(),
        diaChi: document.getElementById('diaChiDVDT').value.trim(),
        emailLienHe: document.getElementById('emailLienHeDVDT').value.trim(),
        soDienThoaiLienHe: document.getElementById('soDienThoaiLienHeDVDT').value.trim(),
        website: document.getElementById('websiteDVDT').value.trim(),
        nguoiDaiDien: document.getElementById('nguoiDaiDienDVDT').value.trim(),
        linhVucDaoTaoChinh: document.getElementById('linhVucDaoTaoChinhDVDT').value.trim(),
        danhGiaDonVi: document.getElementById('danhGiaDonViDVDT').value.trim(),
        ghiChu: document.getElementById('ghiChuDVDT').value.trim()
    };

    if (!donViDaoTaoData.tenDonViDaoTao) {
        hienThiToast('Lỗi', 'Tên đơn vị đào tạo không được để trống.', 'error'); return;
    }

    let payload;
    if (dangChinhSuaDonViDaoTao) {
        donViDaoTaoData.maDonViDaoTao = document.getElementById('maDonViDaoTaoAn').value; 
        payload = { action: 'capNhatDonViDaoTao', duLieu: donViDaoTaoData };
    } else {
        payload = { action: 'themDonViDaoTao', duLieu: donViDaoTaoData };
    }
     try {
        const response = await fetch(API_URL, { method: 'POST', body: JSON.stringify(payload) });
        const result = await response.json();
        if (result.success || result.thanhCong) {
            hienThiToast('Thành công', result.message || result.thongBao || (dangChinhSuaDonViDaoTao ? "Cập nhật thành công!" : "Thêm mới thành công!"), 'success');
            modalDonViDaoTaoInstance.hide();
            taiDanhSachDonViDaoTao(); 
        } else {
            hienThiToast('Lỗi', result.message || result.thongBao || 'Có lỗi xảy ra.', 'error');
        }
    } catch (error) {
        xuLyLoiAPI(error, "luuDonViDaoTao");
    }
}

async function taiDanhSachDonViDaoTao() {
    const tbody = document.getElementById('bangDanhSachDonViDaoTao');
    tbody.innerHTML = '<tr><td colspan="6" class="text-center"><div class="spinner-border spinner-border-sm"></div> Đang tải...</td></tr>';
    try {
        const response = await fetch(`${API_URL}?action=layDanhSachDonViDaoTaoDayDu`); 
        const result = await response.json();
        if (result.success && result.data) {
            hienThiDanhSachDonViDaoTao(result.data);
        } else {
            tbody.innerHTML = `<tr><td colspan="6" class="text-center">${result.message || 'Không tải được dữ liệu.'}</td></tr>`;
            hienThiToast('Lỗi', result.message || 'Không tải được danh sách đơn vị đào tạo.', 'error');
        }
    } catch (error) {
        tbody.innerHTML = '<tr><td colspan="6" class="text-center">Lỗi khi tải dữ liệu.</td></tr>';
        xuLyLoiAPI(error, "taiDanhSachDonViDaoTao");
    }
}

function hienThiDanhSachDonViDaoTao(danhSachDVDT) {
    const tbody = document.getElementById('bangDanhSachDonViDaoTao');
    tbody.innerHTML = '';
    if (!danhSachDVDT || danhSachDVDT.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="text-center">Không có dữ liệu đơn vị đào tạo.</td></tr>';
        return;
    }
    danhSachDVDT.forEach(dv => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${dv.maDonViDaoTao || ''}</td>
            <td>${dv.tenDonViDaoTao || ''}</td>
            <td>${dv.emailLienHe || ''}</td>
            <td>${dv.website || ''}</td>
            <td>${dv.linhVucDaoTaoChinh || ''}</td>
            <td>
                <button class="btn btn-sm btn-outline-primary me-1" onclick='suaDonViDaoTaoAPI("${dv.maDonViDaoTao}")' title="Sửa"><i class="fas fa-edit"></i></button>
                <button class="btn btn-sm btn-outline-danger" onclick='xacNhanXoaDonViDaoTaoAPI("${dv.maDonViDaoTao}", "${dv.tenDonViDaoTao}")' title="Xóa"><i class="fas fa-trash"></i></button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

async function suaDonViDaoTaoAPI(maDonViDaoTao) {
    try {
        const response = await fetch(`${API_URL}?action=layChiTietDonViDaoTao&maDonViDaoTao=${encodeURIComponent(maDonViDaoTao)}`);
        const result = await response.json();
        if (result.success && result.data) {
            moModalSuaDonViDaoTao(result.data);
        } else {
            hienThiToast('Lỗi', result.message || 'Không tìm thấy thông tin đơn vị đào tạo.', 'error');
        }
    } catch (error) {
        xuLyLoiAPI(error, "suaDonViDaoTaoAPI");
    }
}

function xacNhanXoaDonViDaoTaoAPI(maDonViDaoTao, tenDonViDaoTao) {
    document.getElementById('thongTinXoaModal').textContent = `Đơn vị đào tạo: ${tenDonViDaoTao} (Mã: ${maDonViDaoTao})`;
    hamXuLyKhiXacNhanXoa = function() {
        thucHienXoaDonViDaoTaoAPI(maDonViDaoTao, tenDonViDaoTao);
    };
    modalXacNhanXoaInstance.show();
}

async function thucHienXoaDonViDaoTaoAPI(maDonViDaoTao, tenDonViDaoTao) {
     const payload = { action: 'xoaDonViDaoTao', maDonViDaoTao: maDonViDaoTao };
    try {
        const response = await fetch(API_URL, { method: 'POST', body: JSON.stringify(payload) });
        const result = await response.json();
        if (result.success || result.thanhCong) {
            hienThiToast('Thành công', result.message || result.thongBao || `Đã xóa đơn vị đào tạo "${tenDonViDaoTao}".`, 'success');
            taiDanhSachDonViDaoTao();
        } else {
            hienThiToast('Lỗi', result.message || result.thongBao || 'Xóa đơn vị đào tạo thất bại.', 'error');
        }
    } catch (error) {
        xuLyLoiAPI(error, "thucHienXoaDonViDaoTaoAPI");
    }
}


// --- MODULE: CHON NHAN VIEN DAO TAO (Se can cap nhat de dung API) ---
async function taiKhoaHocVaoSelectChonNhanVien() {
    const selectKhoaHoc = document.getElementById('selectKhoaHocChoNhanVien');
    selectKhoaHoc.innerHTML = '<option value="">Đang tải khóa học...</option>';
    try {
        const response = await fetch(`${API_URL}?action=layDanhSachKhoaHoc`);
        const result = await response.json();
        selectKhoaHoc.innerHTML = '<option value="">Vui lòng chọn khóa học...</option>';
        if (result.success && result.data && result.data.length > 0) {
            result.data.forEach(kh => {
                selectKhoaHoc.innerHTML += `<option value="${kh.maKhoaHoc}">${kh.tenKhoaHoc} (Mã: ${kh.maKhoaHoc})</option>`;
            });
        } else {
             selectKhoaHoc.innerHTML = '<option value="">Không có khóa học nào.</option>';
        }
    } catch (error) {
        xuLyLoiAPI(error, "taiKhoaHocVaoSelectChonNhanVien");
        selectKhoaHoc.innerHTML = '<option value="">Lỗi tải khóa học</option>';
    }
}
async function taiPhongBanVaoFilterChonNhanVien() {
     const selectPhongBan = document.getElementById('filterPhongBan');
    selectPhongBan.innerHTML = '<option value="">Đang tải phòng ban...</option>';
    try {
        const response = await fetch(`${API_URL}?action=layDanhSachPhongBan`);
        const result = await response.json();
        selectPhongBan.innerHTML = '<option value="">Tất cả phòng ban</option>';
        if (result.success && result.data) {
            result.data.forEach(pb => {
                selectPhongBan.innerHTML += `<option value="${pb.maPhongBan}">${pb.tenPhongBan}</option>`;
            });
        }
    } catch (error) {
         xuLyLoiAPI(error, "taiPhongBanVaoFilterChonNhanVien");
         selectPhongBan.innerHTML = '<option value="">Lỗi tải phòng ban</option>';
    }
}
function taiDanhSachNhanVienCoTheChon() { hienThiToast("Thông báo", "Chức năng đang được cập nhật để dùng API.", "info");}
function hienThiDanhSachNhanVienDeChon(danhSachNhanVien) {}
function xuLyChonTatCaNhanVien(trangThaiChecked) {}
function xuLyChonMotNhanVien(checkboxElement) {}
function capNhatDanhSachNhanVienDaChonUI() {}
function boChonNhanVienTuDanhSach(maNhanVien) {}
function luuDanhSachHocVienDaChon() { hienThiToast("Thông báo", "Chức năng đang được cập nhật để dùng API.", "info");}
function xuatDanhSachHocVien() {}
