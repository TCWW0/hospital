export interface DepartmentIntro {
  hospitalId: string;
  departmentId: string;
  departmentName: string;
  overview: string;
  typicalSymptoms: string[]; // 常见症状
  diseases: string[]; // 常见病症
  examinations: string[]; // 常规检查项目
  services: string[]; // 可提供的服务（如：初诊评估、健康管理）
  guidance: string[]; // 就诊指引
  location?: string; // 院内位置
  openHours?: string; // 出诊时间
}

const SAMPLE: Record<string, DepartmentIntro> = {
  'h1:d-nei': {
    hospitalId: 'h1',
    departmentId: 'd-nei',
    departmentName: '内科',
    overview: '内科主要负责内科系统常见病、多发病与慢性病的诊疗与管理，涵盖呼吸、消化、心血管、内分泌等多个亚专科。',
    typicalSymptoms: ['发热', '咳嗽', '胸闷', '乏力', '腹痛', '腹泻', '头晕头痛'],
    diseases: ['上呼吸道感染', '支气管炎', '胃炎/胃溃疡', '高血压', '糖尿病', '冠心病'],
    examinations: ['血常规', '尿常规', '肝肾功能', '血糖/血脂', '心电图', '胸片', '腹部彩超'],
    services: ['内科初诊评估', '慢病随访', '用药指导', '健康管理建议'],
    guidance: ['出现发热、咳嗽等急性症状可先到内科就诊', '慢性病患者建议携带既往病历和用药清单', '如有胸痛/呼吸困难等急症症状，请优先急诊就诊'],
    location: '门诊楼 2 层 A 区',
    openHours: '周一至周日 08:00-17:30'
  },
  'h1:d-waike': {
    hospitalId: 'h1',
    departmentId: 'd-waike',
    departmentName: '外科',
    overview: '外科负责各类需要外科手术或手术相关治疗的疾病诊治，含普外、骨科、泌尿外科等。',
    typicalSymptoms: ['创伤出血', '持续性腹痛', '肿块', '运动损伤', '泌尿系统不适'],
    diseases: ['阑尾炎', '疝气', '胆囊炎/结石', '骨折/扭伤', '前列腺增生'],
    examinations: ['凝血功能', '腹部CT/超声', 'X光片', '术前评估'],
    services: ['外科门诊评估', '术前准备与宣教', '术后随访'],
    guidance: ['外伤/大出血等紧急情况优先急诊外科', '需手术者请遵医嘱完善影像学检查和实验室化验'],
    location: '门诊楼 3 层 B 区',
    openHours: '周一至周六 08:00-17:30'
  },
  'h1:d-guke': {
    hospitalId: 'h1',
    departmentId: 'd-guke',
    departmentName: '骨科',
    overview: '骨科专注于四肢、脊柱及关节疾患的保守与手术治疗，提供运动损伤和骨质疾病的系统管理。',
    typicalSymptoms: ['关节疼痛', '行动受限', '骨折', '扭伤', '脊柱不适'],
    diseases: ['骨关节炎', '腰椎间盘突出', '肩袖损伤', '运动性骨折', '骨质疏松'],
    examinations: ['骨密度检测', '关节MRI', 'X光片', 'CT检查', '步态评估'],
    services: ['运动损伤快速门诊', '关节置换术前评估', '骨质疏松筛查与管理', '术后康复指导'],
    guidance: ['近期有外伤或剧烈疼痛请携带影像资料', '慢性关节病变患者建议预约早间专家号', '术后复诊请记录康复进展方便医生评估'],
    location: '门诊楼 4 层 D 区',
    openHours: '周一至周日 08:00-18:00'
  },
  'h2:d-children': {
    hospitalId: 'h2',
    departmentId: 'd-children',
    departmentName: '儿科',
    overview: '儿科面向0-14岁儿童，提供常见儿童疾病的综合诊疗及生长发育、预防保健指导。',
    typicalSymptoms: ['发热', '咳嗽流涕', '腹泻', '厌食', '皮疹', '生长迟缓'],
    diseases: ['上呼吸道感染', '小儿肺炎', '小儿腹泻', '过敏性鼻炎', '注意力缺陷/多动症'],
    examinations: ['儿科常规化验', '肺功能检测', '过敏原筛查', '儿童生长发育评估'],
    services: ['儿童健康体检', '疫苗接种评估', '家庭喂养指导', '慢病随访'],
    guidance: ['就诊请携带儿童预防接种本与既往病历', '发热患儿就诊前尽量测量体温并记录', '夜间急症可前往儿科夜诊或急诊中心'],
    location: '门诊楼 1 层 儿科区域',
    openHours: '周一至周日 07:30-21:00'
  }
};

export async function fetchDepartmentIntro(hospitalId: string, departmentId: string): Promise<DepartmentIntro | null> {
  const key = `${hospitalId}:${departmentId}`;
  const data = SAMPLE[key] || null;
  return new Promise(resolve => setTimeout(() => resolve(data ? { ...data } : null), 80));
}
