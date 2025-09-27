<template>
  <div class="visit-detail" :style="rootVars">
    <a-page-header
      class="page-header"
      :title="detailHeaderTitle"
      :subtitle="detailHeaderSub"
      @back="goBack"
    >

    </a-page-header>

    <div class="content">
      <div class="content-scroll">
        <a-card class="mu-card" :bordered="false">
          <template v-if="loading">
            <a-skeleton :loading="true" animation />
            <a-skeleton :loading="true" animation style="margin-top: 12px" />
          </template>
          <template v-else>
            <template v-if="detail">
              <div id="visit-detail-print-root">
                <div class="summary">
                  <div class="line1">
                    <span class="hospital">{{ detail.hospitalName }}</span>
                    <span class="sep">·</span>
                    <span class="dept">{{ detail.department }}</span>
                    <a-tag size="small" :color="typeColor(detail.visitType)" class="tag">{{ detail.visitType }}</a-tag>
                    <a-tag size="small" :color="statusColor(detail.status)" class="tag outline">{{ detail.status }}</a-tag>
                  </div>
                  <div class="line2">
                    <span class="doctor"><strong>{{ detail.doctorName }}</strong></span>
                    <span class="diag">诊断：{{ detail.diagnosis }}</span>
                  </div>
                  <div class="line3">
                    <span class="time">就诊时间：{{ detail.startTime }}<template v-if="detail.endTime"> ~ {{ detail.endTime }}</template></span>
                    <span class="cost" v-if="detail.cost != null">费用：¥{{ detail.cost }}</span>
                  </div>
                </div>

                <a-divider orientation="left" class = "section-divider"><span class="section-title">医生信息</span></a-divider>
                <a-descriptions :column="2" size="large" :label-style="labelStyle" :value-style="valueStyle">
                  <a-descriptions-item label="医生姓名">{{ detail.doctorName }}</a-descriptions-item>
                  <a-descriptions-item label="科室">{{ detail.department }}</a-descriptions-item>
                  <a-descriptions-item label="联系方式">{{ detail.doctorPhone || '—' }}</a-descriptions-item>
                  <a-descriptions-item label="医生编号">{{ detail.doctorId }}</a-descriptions-item>
                </a-descriptions>

                <a-divider orientation="left" class = "section-divider"><span class="section-title">患者信息</span></a-divider>
                <a-descriptions :column="2" size="large" :label-style="labelStyle" :value-style="valueStyle">
                  <a-descriptions-item label="患者姓名">{{ detail.patientName || '—' }}</a-descriptions-item>
                  <a-descriptions-item label="患者编号">{{ detail.patientId }}</a-descriptions-item>
                  <a-descriptions-item label="患病描述" :span="2">{{ detail.illnessBrief || detail.diagnosis || '—' }}</a-descriptions-item>
                </a-descriptions>

                <a-divider orientation="left" class = "section-divider"><span class="section-title">医院与缴费信息</span></a-divider>
                <a-descriptions :column="2" size="large" :label-style="labelStyle" :value-style="valueStyle">
                  <a-descriptions-item label="医院">{{ detail.hospitalName }}</a-descriptions-item>
                  <a-descriptions-item label="科室">{{ detail.department }}</a-descriptions-item>
                  <a-descriptions-item label="缴纳金额">{{ detail.cost != null ? `¥${detail.cost}` : '—' }}</a-descriptions-item>
                  <a-descriptions-item label="缴纳方式">{{ detail.paymentMethod || '—' }}</a-descriptions-item>
                  <a-descriptions-item label="缴纳编码" :span="2">{{ detail.paymentCode || '—' }}</a-descriptions-item>
                </a-descriptions>

                <a-divider orientation="left" class = "section-divider"><span class="section-title">影像/报告占位</span></a-divider>
                <div class="placeholders">
                  <div class="img-placeholder">影像占位（后续支持图片/报告渲染）</div>
                  <div class="img-placeholder">附加资料占位</div>
                </div>

                <a-descriptions :column="2" size="large" :label-style="labelStyle" :value-style="valueStyle">
                  <a-descriptions-item label="记录编号">{{ detail.id }}</a-descriptions-item>
                  <a-descriptions-item label="备注" :span="1">
                    <span class="text-muted">{{ detail.notes || '—' }}</span>
                  </a-descriptions-item>
                </a-descriptions>

        <a-space class="no-print">
          <a-button type="primary" :disabled="loading || !detail" @click="exportPdf()">导出PDF</a-button>
          <a-button @click="goBack">返回列表</a-button>
        </a-space>

              </div>
              
            </template>

            <template v-else>
              <a-result status="404" title="未找到该就诊记录" description="请返回列表重试或联系管理员">
                <template #extra>
                  <a-button type="primary" @click="goBack">返回</a-button>
                </template>
              </a-result>
            </template>
          </template>
          
        </a-card>
        <div class="button-bottom-spring"></div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { fetchPatientVisitById, type VisitRecord } from '@/api/mock/visits';
import { Message } from '@arco-design/web-vue';

const route = useRoute();
const router = useRouter();

const id = computed(() => String(route.params.id || ''));
const loading = ref(true);
const detail = ref<VisitRecord | null>(null);

const detailHeaderTitle = computed(() => '就诊详情');
const detailHeaderSub = computed(() => (detail.value ? `${detail.value.hospitalName} · ${detail.value.department}` : ''));

// 字号配置（集中管理，可按需调整）
const fontConfig = ref({
  sectionTitle: 18,
  label: 14,
  value: 15,
  summaryTitle: 20,
});
// 提供到根元素的 CSS 变量，样式中统一引用
const rootVars = computed(() => ({
  '--section-title-size': fontConfig.value.sectionTitle + 'px',
  '--label-font-size': fontConfig.value.label + 'px',
  '--value-font-size': fontConfig.value.value + 'px',
  '--summary-title-size': fontConfig.value.summaryTitle + 'px',
}));
// Descriptions 的样式对象（避免字符串导致的类型错误）
const labelStyle = computed(() => ({ width: '140px', color: '#475569', fontSize: fontConfig.value.label + 'px' }));
const valueStyle = computed(() => ({ color: '#0f172a', fontSize: fontConfig.value.value + 'px', lineHeight: '22px' }));

function typeColor(t: VisitRecord['visitType']) {
  switch (t) {
    case '门诊': return 'arcoblue';
    case '复查': return 'cyan';
    case '急诊': return 'orangered';
    case '住院': return 'purple';
    default: return 'arcoblue';
  }
}
function statusColor(s: VisitRecord['status']) {
  switch (s) {
    case '已完成': return 'green';
    case '进行中': return 'gold';
    case '已预约': return 'blue';
    case '已取消': return 'red';
    default: return 'blue';
  }
}

async function load() {
  loading.value = true;
  try {
    const v = await fetchPatientVisitById(id.value);
    if (v) {
      detail.value = v;
    } else {
      // 兜底：未命中mock数据时，构造一个简单的占位详情
      const now = new Date();
      const end = new Date(now.getTime() + 45 * 60 * 1000);
      detail.value = {
        id: id.value,
        patientId: 'p_demo',
        patientName: '示例患者',
        hospitalId: 'h_demo',
        hospitalName: '示例医院',
        department: '心内科',
        doctorId: 'd_demo',
        doctorName: '示例医生',
        doctorPhone: '138-0000-0000',
        diagnosis: '示例诊断',
        illnessBrief: '胃溃疡（占位）',
        visitType: '门诊',
        status: '已完成',
        startTime: formatISO(now),
        endTime: formatISO(end),
        cost: 80,
        notes: '本条为占位数据，供页面原型演示使用。',
        paymentMethod: '微信',
        paymentCode: 'PAY-DEMO-0001'
      } as unknown as VisitRecord;
    }
  } catch (e) {
    console.error(e);
    Message.error('加载详情失败');
  } finally {
    loading.value = false;
  }
}

async function exportPdf() {
  if (!detail.value) return;
  const container = document.getElementById('visit-detail-print-root');
  if (!container) {
    Message.error('未找到可导出的内容区域');
    return;
  }

  // 动态加载依赖，避免首屏增加包体积
  const hideMsg = Message.loading({ content: '正在导出 PDF...', duration: 0 });
  try {
    const [{ default: html2canvas }, { jsPDF }] = await Promise.all([
      import('html2canvas'),
      import('jspdf'),
    ]);

    // 导出前隐藏不需要打印的元素
    const toHide = Array.from(container.querySelectorAll('.no-print')) as HTMLElement[];
    const originalVisibility: string[] = [];
    toHide.forEach((el) => { originalVisibility.push(el.style.visibility); el.style.visibility = 'hidden'; });

    // 使用较高的 scale 提升清晰度
    const scale = Math.max(2, window.devicePixelRatio || 1);
    const canvas = await html2canvas(container, {
      backgroundColor: '#ffffff',
      useCORS: true,
      scale,
      windowWidth: container.scrollWidth,
      windowHeight: container.scrollHeight,
    });

    // 还原可见性
    toHide.forEach((el, i) => { el.style.visibility = originalVisibility[i] ?? ''; });

    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 10; // mm
    const imgWidth = pageWidth - margin * 2;
    const imgHeight = (canvas.height * imgWidth) / canvas.width; // 按比例换算到 mm

    let position = 0; // 已放置的高度（mm），用于计算每页的偏移

    // 首页
    pdf.addImage(imgData, 'PNG', margin, margin, imgWidth, imgHeight);

    // 继续分页绘制：通过 Y 轴负偏移裁切图片
    const contentHeight = imgHeight; // 整体图像高度（mm）
    const pageContentHeight = pageHeight - margin * 2; // 单页可用高度（mm）
    position = pageContentHeight; // 下一页起始处对应的上移距离
    while (position < contentHeight) {
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', margin, margin - position, imgWidth, imgHeight);
      position += pageContentHeight;
    }

    const fileName = `visit-${detail.value.id}.pdf`;
    pdf.save(fileName);
    Message.success('PDF 导出完成');
  } catch (e) {
    console.error(e);
    Message.error('导出 PDF 失败');
  } finally {
    // 关闭加载提示
    // @ts-ignore
    hideMsg?.close?.();
  }
}

function goBack() {
  // 优先使用历史后退，避免父容器保持在同一路由视图时不刷新
  if (window.history.length > 1) {
    router.back();
    // 兜底：如果 150ms 后路由没变更，再强制跳回列表
    setTimeout(() => {
      if (router.currentRoute.value.path.includes('/patient/visit/')) {
        router.push('/patient/visits');
      }
    }, 150);
  } else {
    router.push('/patient/visits');
  }
}

onMounted(load);

// 当在详情页内切换不同 id（如从 v1 直接跳到 v2）时，重新加载并显示骨架屏
watch(
  () => route.params.id,
  () => {
    loading.value = true;
    detail.value = null;
    load();
  }
);

function pad(n: number) {
  return n < 10 ? `0${n}` : `${n}`;
}
function formatISO(dt: Date) {
  const y = dt.getFullYear();
  const m = pad(dt.getMonth() + 1);
  const d = pad(dt.getDate());
  const hh = pad(dt.getHours());
  const mm = pad(dt.getMinutes());
  const ss = pad(dt.getSeconds());
  return `${y}-${m}-${d} ${hh}:${mm}:${ss}`;
}
</script>

<style lang="less" scoped>
.visit-detail { display:flex; flex-direction:column; gap:12px; padding: 8px 0; height: 100vh; }
.page-header {background: #fff;border: 1px solid rgba(11,95,255,0.06); border-radius: 10px; box-shadow: 0 6px 18px rgba(15,23,42,0.06);flex-shrink: 0;  }
.content { flex:1 ;margin-top: 8px; overflow: hidden; display:flex; flex-direction: column; min-height: 0;}
/* 滚动发生在卡片外层容器 */
.content-scroll{
  flex: 1 1 auto;
  min-height: 0;
  overflow: auto;
  box-sizing: border-box;
  padding-right: 8px; /* 预留滚动条间距 */
  padding-bottom: 28px; /* 避免底部内容被裁剪 */
  overscroll-behavior: contain;
  -webkit-overflow-scrolling: touch;
}
/* 卡片自身不再作为滚动容器 */
.mu-card { border: 1px solid rgba(0,0,0,0.08); box-shadow: 0 8px 24px rgba(0,0,0,0.08); border-radius: 10px; }

/* 自定义滚动条（应用在外层滚动容器） */
.content-scroll::-webkit-scrollbar{width:10px;height:10px}
.content-scroll::-webkit-scrollbar-track{background:transparent}
.content-scroll::-webkit-scrollbar-thumb{background:#e2e8f0;border-radius:8px}
.content-scroll:hover::-webkit-scrollbar-thumb{background:#cbd5e1}
.content-scroll{ scrollbar-width: thin; scrollbar-color: #cbd5e1 transparent }
.summary { display:flex; flex-direction:column; gap:8px; margin-bottom: 12px; }
.summary .line1 { display:flex; align-items:center; gap:8px; color:#0f3ea5; font-weight:800; font-size: var(--summary-title-size); }
.summary .line2 { color:#374151; }
.summary .line2 .doctor { color:#0f3ea5; }
.summary .line3 { color:#6b7280; font-size:14px; display:flex; gap:16px; }
.summary .tag.outline { background:#f6f9ff; }

.hospital { font-size:20px; color:#111827; }
.dept { color:#374151; font-weight:600; }
.sep { color:#9aa5b1; }
.cost { color:#0f3ea5; font-weight:800; }

/* 控制分隔线本身的间距 */
.section-divider {  margin: 28px 0 32px; /* 上下空隙 */}
/* 分段标题 */
.section-title { font-size: var(--section-title-size); color:#0f172a; font-weight: 600; }
/* Descriptions 值的字号（标签字号由 labelStyle 控制） */
:deep(.arco-descriptions-item-value) { font-size: var(--value-font-size); }
/* 占位图片区域 */
.placeholders { display:flex; gap:12px; margin: 8px 0 4px; }
.img-placeholder { flex:1; min-height:360px; background: repeating-linear-gradient(45deg, #f8fafc, #f8fafc 10px, #eef2ff 10px, #eef2ff 20px); border:1px dashed #cbd5e1; color:#64748b; display:flex; align-items:center; justify-content:center; border-radius:8px; font-size:13px; }

.button-bottom-spring {
  flex-grow: 1;      // 弹性填充剩余空间
  min-height: 64px;  // 最小占位高度，可按需调整
}
</style>
