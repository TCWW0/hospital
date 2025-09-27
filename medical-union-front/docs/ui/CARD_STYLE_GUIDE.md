# 卡片样式规范（Card Style Guide）

本规范记录前端通用卡片的样式约定，便于在不同页面维持一致的观感与交互。

## 1. 适用场景
- 列表项容器（就诊记录、医生列表、预约记录等）
- 详情块（抽屉中的信息块、侧边信息卡）

## 2. 视觉规范
- 背景：#FFFFFF（浅色主题）
- 圆角：10px
- 边框：1px solid rgba(11,95,255,0.06)
- 阴影（常态）：0 6px 18px rgba(15,23,42,0.06)
- 阴影（悬停）：0 12px 36px rgba(15,23,42,0.08)
- 过渡：transform .12s ease, box-shadow .12s ease
- 内边距：18px 20px
- 最小高度：110px（针对列表卡片）

## 3. 布局建议
- 左侧主体信息区（标题/标签/次要信息三行结构）
- 右侧操作区（按钮集合 a-space）
- 行间距：8px~14px

## 4. 标准类名
- 容器：`.mu-card`
- 悬停交互：`.mu-card--interactive`（可与 `.mu-card` 组合使用）
- 标题行：`.mu-card__title`
- 次要信息行：`.mu-card__meta`

## 5. 颜色建议
- 主文字（标题）：#111827
- 次文字（副标题/元信息）：#374151 / #6b7280
- 标签（类型/状态）：使用 Arco Tag，颜色映射由业务函数提供（如 typeColor/statusColor）

## 6. 使用示例
```vue
<div class="mu-card mu-card--interactive">
  <div class="mu-card__title">标题</div>
  <div class="mu-card__meta">元信息</div>
  <div class="actions">
    <a-button type="text">操作</a-button>
  </div>
</div>
```

> 注：`Visits.vue` 中的 `.visit-card.card-like` 即符合上述规范，可逐步替换为 `.mu-card mu-card--interactive`。
