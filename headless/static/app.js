const API = {
  session: "/api/v1/session",
  login: "/api/v1/auth/login",
  logout: "/api/v1/auth/logout",
  snapshot: "/api/v1/snapshot",
  events: "/api/v1/events",
  inventoryRefresh: "/api/v1/actions/inventory-refresh",
  channelSwitch: (id) =>
    `/api/v1/actions/channels/${encodeURIComponent(String(id))}/switch`,
  revokeToken: "/api/v1/account/token",
  settings: "/api/v1/settings",
  restart: "/api/v1/actions/restart",
};

const translations = {
  "zh-CN": {
    "common.skip": "跳到主要内容",
    "common.loading": "正在连接管理服务…",
    "common.language": "界面语言",
    "common.logout": "退出管理界面",
    "common.action": "操作",
    "common.add": "添加",
    "common.save": "保存更改",
    "common.cancel": "取消",
    "common.confirm": "确认",
    "common.copy": "复制",
    "common.copied": "已复制",
    "common.yes": "是",
    "common.no": "否",
    "common.unknown": "未知",
    "common.none": "无",
    "common.localAccess": "本地访问",
    "brand.console": "Headless Console",
    "login.subtitle": "VPS 管理控制台",
    "login.eyebrow": "安全访问",
    "login.title": "登录管理界面",
    "login.note": "这里使用的是管理界面账号，不是 Twitch 账号。Twitch 将在登录后通过设备码连接。",
    "login.username": "用户名",
    "login.password": "密码",
    "login.submit": "登录",
    "login.signingIn": "正在登录…",
    "login.invalid": "用户名或密码不正确。",
    "login.rateLimited": "尝试次数过多，请一分钟后再试。",
    "login.failed": "无法登录管理界面，请稍后重试。",
    "nav.overview": "总览",
    "nav.campaigns": "活动",
    "nav.settings": "设置",
    "nav.system": "系统",
    "connection.connecting": "正在连接",
    "connection.online": "实时连接",
    "connection.offline": "连接已断开",
    "connection.reconnecting": "正在重连",
    "service.connecting": "连接中",
    "service.running": "运行中",
    "service.starting": "启动中",
    "service.stopped": "已停止",
    "service.errorTitle": "服务需要处理",
    "overview.eyebrow": "实时状态",
    "overview.title": "运行总览",
    "overview.updated": "更新于 {time}",
    "overview.service": "矿工服务",
    "overview.account": "Twitch 账号",
    "overview.connections": "Twitch 连接",
    "overview.connectionActive": "{active}/{total} 个已连接",
    "overview.nowMining": "正在获取",
    "overview.drop": "掉落",
    "overview.activeDrop": "当前掉落",
    "overview.noDrop": "当前没有正在获取的掉落",
    "overview.noDropBody": "矿工会在找到符合条件的直播后自动开始。",
    "overview.identity": "身份",
    "overview.twitchConnection": "Twitch 连接",
    "overview.availableStreams": "可用直播",
    "overview.channels": "频道",
    "overview.campaign": "活动",
    "overview.game": "游戏",
    "overview.rewards": "奖励",
    "overview.dropProgress": "掉落进度",
    "overview.campaignProgress": "活动进度",
    "overview.remaining": "剩余 {time}",
    "overview.claimed": "已领取 {claimed}/{total}",
    "account.userId": "用户 ID：{id}",
    "account.connected": "已连接 Twitch",
    "account.waiting": "等待 Twitch 登录",
    "account.activationTitle": "使用设备码连接 Twitch",
    "account.activationBody": "在新标签页打开 Twitch，然后输入下方设备码。管理界面不会接触你的 Twitch 密码。",
    "account.openTwitch": "打开 Twitch",
    "account.copyCode": "复制设备码",
    "account.codeCopied": "设备码已复制。",
    "account.noCode": "后端正在申请新的 Twitch 设备码。",
    "actions.refreshInventory": "刷新库存",
    "actions.refresh": "刷新",
    "actions.restart": "重启后端",
    "actions.disconnect": "断开 Twitch",
    "actions.switch": "切换",
    "actions.switching": "切换中",
    "actions.open": "打开",
    "actions.remove": "移除",
    "actions.moveTop": "移到最前",
    "actions.moveUp": "上移",
    "actions.moveDown": "下移",
    "actions.moveBottom": "移到最后",
    "actions.requestAccepted": "操作已提交。",
    "actions.refreshAccepted": "库存刷新已提交。",
    "actions.switchAccepted": "频道切换已提交。",
    "actions.restartAccepted": "后端重启已提交，实时连接会自动恢复。",
    "actions.disconnectAccepted": "Twitch 令牌已撤销。",
    "channels.channel": "频道",
    "channels.status": "状态",
    "channels.game": "游戏",
    "channels.drops": "掉落",
    "channels.viewers": "观众",
    "channels.source": "来源",
    "channels.online": "在线",
    "channels.pending": "等待上线",
    "channels.offline": "离线",
    "channels.watching": "正在观看",
    "channels.acl": "限定频道",
    "channels.directory": "公开目录",
    "channels.enabled": "已启用",
    "channels.disabled": "未启用",
    "channels.emptyTitle": "暂时没有频道",
    "channels.emptyBody": "矿工正在寻找符合当前掉落条件的直播。",
    "campaigns.eyebrow": "Drops Inventory",
    "campaigns.title": "掉落活动",
    "campaigns.description": "查看当前、即将开始和已结束的掉落活动。",
    "campaigns.searchLabel": "搜索活动或游戏",
    "campaigns.searchPlaceholder": "输入活动或游戏名称",
    "campaigns.show": "显示",
    "campaigns.active": "进行中",
    "campaigns.upcoming": "即将开始",
    "campaigns.expired": "已结束",
    "campaigns.unlinked": "未关联",
    "campaigns.excluded": "已排除",
    "campaigns.finished": "已完成",
    "campaigns.linked": "已关联",
    "campaigns.eligible": "可获取",
    "campaigns.claimed": "已领取",
    "campaigns.claimable": "可领取",
    "campaigns.earnable": "可获取",
    "campaigns.starts": "开始",
    "campaigns.ends": "结束",
    "campaigns.allowedChannels": "允许频道",
    "campaigns.allChannels": "全部频道",
    "campaigns.progress": "进度",
    "campaigns.remaining": "剩余",
    "campaigns.dropCount": "{claimed}/{total} 个掉落",
    "campaigns.resultCount": "显示 {visible} / {total} 个活动",
    "campaigns.emptyTitle": "没有符合条件的活动",
    "campaigns.emptyBody": "调整筛选条件，或刷新 Twitch 库存。",
    "campaigns.moreDrops": "另有 {count} 个掉落",
    "settings.eyebrow": "挖矿偏好",
    "settings.title": "设置",
    "settings.description": "设置保存后会触发库存刷新，并重新计算目标游戏。",
    "settings.saved": "已保存",
    "settings.unsaved": "未保存",
    "settings.saving": "保存中",
    "settings.generalEyebrow": "常规",
    "settings.general": "运行偏好",
    "settings.minerLanguage": "矿工语言",
    "settings.languageHint": "修改矿工语言后可能需要重启后端。",
    "settings.priorityMode": "优先模式",
    "settings.priorityOnly": "仅优先列表",
    "settings.endingSoonest": "最早结束优先",
    "settings.lowAvailability": "低可用性优先",
    "settings.proxy": "代理地址",
    "settings.proxyHint": "留空表示不使用代理；已保存的密码不会回显。",
    "settings.proxyConfigured": "代理已配置；密码已隐藏。",
    "settings.connectionQuality": "连接质量倍率",
    "settings.connectionHint": "网络较慢时提高；数值越高，请求超时等待越久。",
    "settings.advancedEyebrow": "高级",
    "settings.advanced": "额外检查",
    "settings.badgesEmotes": "徽章与表情掉落",
    "settings.badgesEmotesHint": "将徽章和表情奖励纳入活动筛选。",
    "settings.availableDropsCheck": "可用掉落检查",
    "settings.availableDropsHint": "额外验证直播是否实际启用掉落。",
    "settings.notifications": "浏览器掉落通知",
    "settings.notificationsHint": "这是当前浏览器的本地偏好，不会上传密码或令牌。",
    "settings.defaultDark": "默认深色界面",
    "settings.defaultDarkHint": "作为新浏览器首次访问时的默认主题。",
    "settings.ordered": "有序列表",
    "settings.priorityGames": "优先游戏",
    "settings.unordered": "排除列表",
    "settings.excludedGames": "排除游戏",
    "settings.gameName": "游戏名称",
    "settings.addGame": "添加游戏",
    "settings.priorityEmpty": "尚未添加优先游戏。",
    "settings.excludeEmpty": "尚未排除任何游戏。",
    "settings.saveTitle": "保存设置",
    "settings.saveHint": "当前没有未保存的更改。",
    "settings.unsavedHint": "有更改尚未保存。",
    "settings.savedToast": "设置已保存，矿工将重新加载。",
    "settings.conflict": "另一个浏览器已修改设置。已载入最新版本，请重新检查。",
    "settings.duplicate": "该游戏已在列表中。",
    "settings.invalidGame": "请输入有效的游戏名称。",
    "settings.notificationDenied": "浏览器未授予通知权限。",
    "system.eyebrow": "维护与诊断",
    "system.title": "系统",
    "system.description": "查看运行信息、活动日志和账户级操作。",
    "system.runtimeEyebrow": "Runtime",
    "system.runtime": "运行信息",
    "system.networkEyebrow": "Network",
    "system.connections": "Twitch WebSocket",
    "system.activityEyebrow": "Recent events",
    "system.activity": "活动日志",
    "system.searchLogs": "搜索日志",
    "system.copyLogs": "复制日志",
    "system.noActivity": "暂无活动日志",
    "system.dangerEyebrow": "需确认的操作",
    "system.danger": "维护操作",
    "system.restartTitle": "重启矿工后端",
    "system.restartBody": "短暂中断当前连接并重新初始化，Web 管理界面会自动重连。",
    "system.disconnectTitle": "断开 Twitch 账号",
    "system.disconnectBody": "撤销 Twitch 访问令牌并清除登录 Cookie，之后需要重新输入设备码。",
    "system.restartConfirmTitle": "确认重启后端？",
    "system.restartConfirmBody": "当前 Twitch 连接会短暂中断，掉落进度不会被手动重置。",
    "system.disconnectConfirmTitle": "确认断开 Twitch？",
    "system.disconnectConfirmBody": "这会撤销当前令牌并清除登录状态。恢复挖矿需要重新完成设备码授权。",
    "system.version": "版本",
    "system.status": "状态",
    "system.ready": "就绪",
    "system.started": "启动时间",
    "system.uptime": "运行时长",
    "system.revision": "状态版本",
    "system.generated": "快照时间",
    "system.connection": "连接 #{id}",
    "system.topics": "{count} 个主题",
    "system.noConnections": "暂无 Twitch WebSocket 连接。",
    "system.logsCopied": "活动日志已复制。",
    "theme.system": "跟随系统主题",
    "theme.light": "浅色主题",
    "theme.dark": "深色主题",
    "errors.generic": "操作未完成，请稍后重试。",
    "errors.unauthorized": "管理会话已过期，请重新登录。",
    "errors.invalidCommand": "请求内容无效。",
    "errors.offline": "无法连接管理服务。",
  },
  en: {
    "common.skip": "Skip to main content",
    "common.loading": "Connecting to the management service…",
    "common.language": "Interface language",
    "common.logout": "Sign out",
    "common.action": "Action",
    "common.add": "Add",
    "common.save": "Save changes",
    "common.cancel": "Cancel",
    "common.confirm": "Confirm",
    "common.copy": "Copy",
    "common.copied": "Copied",
    "common.yes": "Yes",
    "common.no": "No",
    "common.unknown": "Unknown",
    "common.none": "None",
    "common.localAccess": "Local access",
    "brand.console": "Headless Console",
    "login.subtitle": "VPS management console",
    "login.eyebrow": "Secure access",
    "login.title": "Sign in to the console",
    "login.note": "Use your web management credentials here, not your Twitch password. Twitch connects later with a device code.",
    "login.username": "Username",
    "login.password": "Password",
    "login.submit": "Sign in",
    "login.signingIn": "Signing in…",
    "login.invalid": "Invalid username or password.",
    "login.rateLimited": "Too many attempts. Try again in one minute.",
    "login.failed": "The management console could not sign you in.",
    "nav.overview": "Overview",
    "nav.campaigns": "Campaigns",
    "nav.settings": "Settings",
    "nav.system": "System",
    "connection.connecting": "Connecting",
    "connection.online": "Live connection",
    "connection.offline": "Connection lost",
    "connection.reconnecting": "Reconnecting",
    "service.connecting": "Connecting",
    "service.running": "Running",
    "service.starting": "Starting",
    "service.stopped": "Stopped",
    "service.errorTitle": "Service needs attention",
    "overview.eyebrow": "Live status",
    "overview.title": "Runtime overview",
    "overview.updated": "Updated {time}",
    "overview.service": "Miner service",
    "overview.account": "Twitch account",
    "overview.connections": "Twitch connections",
    "overview.connectionActive": "{active} of {total} connected",
    "overview.nowMining": "Now earning",
    "overview.drop": "Drop",
    "overview.activeDrop": "Current drop",
    "overview.noDrop": "No drop is being earned right now",
    "overview.noDropBody": "The miner starts automatically when an eligible live channel is found.",
    "overview.identity": "Identity",
    "overview.twitchConnection": "Twitch connection",
    "overview.availableStreams": "Available streams",
    "overview.channels": "Channels",
    "overview.campaign": "Campaign",
    "overview.game": "Game",
    "overview.rewards": "Rewards",
    "overview.dropProgress": "Drop progress",
    "overview.campaignProgress": "Campaign progress",
    "overview.remaining": "{time} remaining",
    "overview.claimed": "{claimed} of {total} claimed",
    "account.userId": "User ID: {id}",
    "account.connected": "Connected to Twitch",
    "account.waiting": "Waiting for Twitch sign-in",
    "account.activationTitle": "Connect Twitch with a device code",
    "account.activationBody": "Open Twitch in a new tab and enter the code below. This console never handles your Twitch password.",
    "account.openTwitch": "Open Twitch",
    "account.copyCode": "Copy device code",
    "account.codeCopied": "Device code copied.",
    "account.noCode": "The backend is requesting a new Twitch device code.",
    "actions.refreshInventory": "Refresh inventory",
    "actions.refresh": "Refresh",
    "actions.restart": "Restart backend",
    "actions.disconnect": "Disconnect Twitch",
    "actions.switch": "Switch",
    "actions.switching": "Switching",
    "actions.open": "Open",
    "actions.remove": "Remove",
    "actions.moveTop": "Move to top",
    "actions.moveUp": "Move up",
    "actions.moveDown": "Move down",
    "actions.moveBottom": "Move to bottom",
    "actions.requestAccepted": "The action was queued.",
    "actions.refreshAccepted": "Inventory refresh queued.",
    "actions.switchAccepted": "Channel switch queued.",
    "actions.restartAccepted": "Backend restart queued. Live updates will reconnect automatically.",
    "actions.disconnectAccepted": "The Twitch token was revoked.",
    "channels.channel": "Channel",
    "channels.status": "Status",
    "channels.game": "Game",
    "channels.drops": "Drops",
    "channels.viewers": "Viewers",
    "channels.source": "Source",
    "channels.online": "Online",
    "channels.pending": "Pending",
    "channels.offline": "Offline",
    "channels.watching": "Watching",
    "channels.acl": "Restricted",
    "channels.directory": "Directory",
    "channels.enabled": "Enabled",
    "channels.disabled": "Disabled",
    "channels.emptyTitle": "No channels yet",
    "channels.emptyBody": "The miner is looking for live streams that match the current drop.",
    "campaigns.eyebrow": "Drops Inventory",
    "campaigns.title": "Drop campaigns",
    "campaigns.description": "Review active, upcoming, and expired drop campaigns.",
    "campaigns.searchLabel": "Search campaign or game",
    "campaigns.searchPlaceholder": "Enter a campaign or game",
    "campaigns.show": "Show",
    "campaigns.active": "Active",
    "campaigns.upcoming": "Upcoming",
    "campaigns.expired": "Expired",
    "campaigns.unlinked": "Not linked",
    "campaigns.excluded": "Excluded",
    "campaigns.finished": "Finished",
    "campaigns.linked": "Linked",
    "campaigns.eligible": "Eligible",
    "campaigns.claimed": "Claimed",
    "campaigns.claimable": "Ready to claim",
    "campaigns.earnable": "Earnable",
    "campaigns.starts": "Starts",
    "campaigns.ends": "Ends",
    "campaigns.allowedChannels": "Allowed channels",
    "campaigns.allChannels": "All channels",
    "campaigns.progress": "Progress",
    "campaigns.remaining": "Remaining",
    "campaigns.dropCount": "{claimed}/{total} drops",
    "campaigns.resultCount": "Showing {visible} of {total} campaigns",
    "campaigns.emptyTitle": "No matching campaigns",
    "campaigns.emptyBody": "Adjust the filters or refresh the Twitch inventory.",
    "campaigns.moreDrops": "{count} more drops",
    "settings.eyebrow": "Mining preferences",
    "settings.title": "Settings",
    "settings.description": "Saving reloads the miner and recalculates the target games.",
    "settings.saved": "Saved",
    "settings.unsaved": "Unsaved",
    "settings.saving": "Saving",
    "settings.generalEyebrow": "General",
    "settings.general": "Runtime preferences",
    "settings.minerLanguage": "Miner language",
    "settings.languageHint": "Changing the miner language may require a backend restart.",
    "settings.priorityMode": "Priority mode",
    "settings.priorityOnly": "Priority list only",
    "settings.endingSoonest": "Ending soonest first",
    "settings.lowAvailability": "Low availability first",
    "settings.proxy": "Proxy URL",
    "settings.proxyHint": "Leave empty for no proxy. Saved passwords are never revealed.",
    "settings.proxyConfigured": "A proxy is configured; its password is hidden.",
    "settings.connectionQuality": "Connection quality multiplier",
    "settings.connectionHint": "Raise this on slow networks; higher values wait longer before timing out.",
    "settings.advancedEyebrow": "Advanced",
    "settings.advanced": "Additional checks",
    "settings.badgesEmotes": "Badge and emote drops",
    "settings.badgesEmotesHint": "Include badge and emote rewards when filtering campaigns.",
    "settings.availableDropsCheck": "Available drops check",
    "settings.availableDropsHint": "Additionally verify that a live stream has drops enabled.",
    "settings.notifications": "Browser drop notifications",
    "settings.notificationsHint": "This is local to this browser and never uploads passwords or tokens.",
    "settings.defaultDark": "Default dark interface",
    "settings.defaultDarkHint": "Use dark mode by default for browsers without a saved preference.",
    "settings.ordered": "Ordered list",
    "settings.priorityGames": "Priority games",
    "settings.unordered": "Exclusion list",
    "settings.excludedGames": "Excluded games",
    "settings.gameName": "Game name",
    "settings.addGame": "Add game",
    "settings.priorityEmpty": "No priority games have been added.",
    "settings.excludeEmpty": "No games are excluded.",
    "settings.saveTitle": "Save settings",
    "settings.saveHint": "There are no unsaved changes.",
    "settings.unsavedHint": "You have unsaved changes.",
    "settings.savedToast": "Settings saved. The miner is reloading.",
    "settings.conflict": "Settings changed in another browser. The latest version is loaded; review it and try again.",
    "settings.duplicate": "That game is already in the list.",
    "settings.invalidGame": "Enter a valid game name.",
    "settings.notificationDenied": "This browser did not grant notification permission.",
    "system.eyebrow": "Maintenance and diagnostics",
    "system.title": "System",
    "system.description": "Review runtime information, activity logs, and account-level actions.",
    "system.runtimeEyebrow": "Runtime",
    "system.runtime": "Runtime details",
    "system.networkEyebrow": "Network",
    "system.connections": "Twitch WebSockets",
    "system.activityEyebrow": "Recent events",
    "system.activity": "Activity log",
    "system.searchLogs": "Search logs",
    "system.copyLogs": "Copy logs",
    "system.noActivity": "No activity has been recorded.",
    "system.dangerEyebrow": "Confirmation required",
    "system.danger": "Maintenance actions",
    "system.restartTitle": "Restart miner backend",
    "system.restartBody": "Briefly reconnect and reinitialize the miner. The web console reconnects automatically.",
    "system.disconnectTitle": "Disconnect Twitch account",
    "system.disconnectBody": "Revoke the Twitch access token and clear login cookies. A new device code will be required.",
    "system.restartConfirmTitle": "Restart the backend?",
    "system.restartConfirmBody": "Current Twitch connections will briefly stop. Earned progress is not manually reset.",
    "system.disconnectConfirmTitle": "Disconnect Twitch?",
    "system.disconnectConfirmBody": "This revokes the current token and clears the login state. Device-code authorization is required to resume.",
    "system.version": "Version",
    "system.status": "Status",
    "system.ready": "Ready",
    "system.started": "Started",
    "system.uptime": "Uptime",
    "system.revision": "State revision",
    "system.generated": "Snapshot time",
    "system.connection": "Connection #{id}",
    "system.topics": "{count} topics",
    "system.noConnections": "No Twitch WebSocket connections.",
    "system.logsCopied": "Activity log copied.",
    "theme.system": "Use system theme",
    "theme.light": "Use light theme",
    "theme.dark": "Use dark theme",
    "errors.generic": "The action could not be completed. Try again.",
    "errors.unauthorized": "Your management session expired. Sign in again.",
    "errors.invalidCommand": "The request was invalid.",
    "errors.offline": "The management service could not be reached.",
  },
};

class ApiError extends Error {
  constructor(message, status = 0, code = "") {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
  }
}

const state = {
  locale: localStorage.getItem("tdm.locale") || (navigator.language?.startsWith("zh") ? "zh-CN" : "en"),
  theme: localStorage.getItem("tdm.theme") || "system",
  themeInitialized: Boolean(localStorage.getItem("tdm.theme")),
  currentView: ["overview", "campaigns", "settings", "system"].includes(location.hash.slice(1))
    ? location.hash.slice(1)
    : "overview",
  session: {
    auth_required: false,
    authenticated: false,
    username: null,
    csrf_token: null,
  },
  snapshot: null,
  eventSource: null,
  sseState: "connecting",
  renderSignatures: new Map(),
  settingsDraft: null,
  settingsBaseRevision: null,
  settingsDirty: false,
  settingsSaving: false,
  priorityDraft: [],
  excludeDraft: [],
  browserNotifications: localStorage.getItem("tdm.notifications") === "1",
  knownActivityKeys: null,
  confirmAction: null,
  dropCountdown: null,
  sessionCheckPending: false,
};

const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

function textNode(value) {
  return document.createTextNode(value == null ? "" : String(value));
}

function node(tag, className = "", text = null) {
  const element = document.createElement(tag);
  if (className) {
    element.className = className;
  }
  if (text !== null && text !== undefined) {
    element.textContent = String(text);
  }
  return element;
}

function setText(target, value) {
  const element = typeof target === "string" ? $(target) : target;
  if (element) {
    element.textContent = value == null || value === "" ? "—" : String(value);
  }
}

function tr(key, values = {}) {
  const table = translations[state.locale] || translations.en;
  const fallback = translations.en[key] || key;
  let result = table[key] || fallback;
  for (const [name, value] of Object.entries(values)) {
    result = result.replaceAll(`{${name}}`, String(value));
  }
  return result;
}

function applyTranslations() {
  document.documentElement.lang = state.locale;
  document.documentElement.dir = "ltr";
  $$("[data-i18n]").forEach((element) => {
    element.textContent = tr(element.dataset.i18n);
  });
  $$("[data-i18n-placeholder]").forEach((element) => {
    element.setAttribute("placeholder", tr(element.dataset.i18nPlaceholder));
  });
  $$("[data-i18n-aria]").forEach((element) => {
    const label = tr(element.dataset.i18nAria);
    element.setAttribute("aria-label", label);
    element.setAttribute("title", label);
  });
  $("#login-language").value = state.locale;
  $("#app-language").value = state.locale;
  state.renderSignatures.clear();
  updateThemeButton();
  if (state.snapshot) {
    renderSnapshot(state.snapshot, true);
  }
  updateSettingsState();
}

function setLocale(locale) {
  if (!translations[locale]) {
    return;
  }
  state.locale = locale;
  localStorage.setItem("tdm.locale", locale);
  applyTranslations();
}

function applyTheme(theme) {
  const allowed = new Set(["system", "light", "dark"]);
  state.theme = allowed.has(theme) ? theme : "system";
  document.documentElement.dataset.theme = state.theme;
  localStorage.setItem("tdm.theme", state.theme);
  const dark =
    state.theme === "dark" ||
    (state.theme === "system" && matchMedia("(prefers-color-scheme: dark)").matches);
  const meta = $('meta[name="theme-color"]');
  if (meta) {
    meta.setAttribute("content", dark ? "#0d0c11" : "#6f38d6");
  }
  updateThemeButton();
}

function updateThemeButton() {
  const labels = {
    system: "theme.system",
    light: "theme.light",
    dark: "theme.dark",
  };
  const icons = { system: "◐", light: "☀", dark: "☾" };
  const button = $("#theme-toggle");
  const label = tr(labels[state.theme]);
  button.setAttribute("aria-label", label);
  button.setAttribute("title", label);
  $("#theme-icon").textContent = icons[state.theme];
}

function cycleTheme() {
  const order = ["system", "light", "dark"];
  applyTheme(order[(order.indexOf(state.theme) + 1) % order.length]);
}

function setView(view, { focus = true, updateHash = true } = {}) {
  if (!["overview", "campaigns", "settings", "system"].includes(view)) {
    view = "overview";
  }
  state.currentView = view;
  $$("[data-view-panel]").forEach((panel) => {
    panel.hidden = panel.dataset.viewPanel !== view;
  });
  $$("[data-view]").forEach((button) => {
    if (button.dataset.view === view) {
      button.setAttribute("aria-current", "page");
    } else {
      button.removeAttribute("aria-current");
    }
  });
  if (updateHash && location.hash !== `#${view}`) {
    history.replaceState(null, "", `#${view}`);
  }
  if (focus) {
    const title = $(`#view-${view} h1`);
    if (title) {
      title.setAttribute("tabindex", "-1");
      title.focus({ preventScroll: true });
    }
    window.scrollTo({ top: 0, behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
  }
}

async function api(url, options = {}) {
  const method = (options.method || "GET").toUpperCase();
  const headers = new Headers(options.headers || {});
  headers.set("Accept", "application/json");
  if (options.body !== undefined) {
    headers.set("Content-Type", "application/json");
  }
  if (!["GET", "HEAD"].includes(method) && state.session.csrf_token) {
    headers.set("X-CSRF-Token", state.session.csrf_token);
  }

  let response;
  try {
    response = await fetch(url, {
      method,
      headers,
      credentials: "same-origin",
      body: options.body === undefined ? undefined : JSON.stringify(options.body),
    });
  } catch (error) {
    throw new ApiError(tr("errors.offline"), 0, "offline");
  }

  const contentType = response.headers.get("content-type") || "";
  let payload = null;
  if (contentType.includes("application/json")) {
    try {
      payload = await response.json();
    } catch {
      payload = null;
    }
  }
  if (!response.ok) {
    const message = payload?.message || payload?.error || response.statusText || tr("errors.generic");
    throw new ApiError(message, response.status, payload?.error || "");
  }
  return payload;
}

function errorText(error) {
  if (!(error instanceof ApiError)) {
    return tr("errors.generic");
  }
  if (error.code === "invalid_credentials") {
    return tr("login.invalid");
  }
  if (error.code === "rate_limited") {
    return tr("login.rateLimited");
  }
  if (error.status === 401 || error.code === "unauthorized") {
    return tr("errors.unauthorized");
  }
  if (error.code === "invalid_command") {
    return error.message || tr("errors.invalidCommand");
  }
  if (error.code === "offline") {
    return tr("errors.offline");
  }
  return error.message || tr("errors.generic");
}

function showLoading() {
  $("#loading-view").hidden = false;
  $("#login-view").hidden = true;
  $("#app-shell").hidden = true;
}

function showLogin(message = "") {
  closeEvents();
  $("#loading-view").hidden = true;
  $("#login-view").hidden = false;
  $("#app-shell").hidden = true;
  const error = $("#login-error");
  error.hidden = !message;
  error.textContent = message;
  requestAnimationFrame(() => $("#login-username").focus());
}

function showApp() {
  $("#loading-view").hidden = true;
  $("#login-view").hidden = true;
  $("#app-shell").hidden = false;
  $("#management-logout").hidden = !state.session.auth_required;
  if (state.session.username) {
    $("#management-logout").setAttribute("title", state.session.username);
  }
  setView(state.currentView, { focus: false, updateHash: true });
}

async function loadSession({ quiet = false } = {}) {
  if (!quiet) {
    showLoading();
  }
  try {
    const session = await api(API.session);
    state.session = {
      auth_required: Boolean(session?.auth_required),
      authenticated: Boolean(session?.authenticated),
      username: session?.username || null,
      csrf_token: session?.csrf_token || null,
    };
    if (state.session.auth_required && !state.session.authenticated) {
      showLogin();
      return false;
    }
    showApp();
    await loadSnapshot();
    openEvents();
    return true;
  } catch (error) {
    if (!quiet) {
      showLogin(errorText(error));
    }
    return false;
  }
}

async function loadSnapshot() {
  try {
    const snapshot = await api(API.snapshot);
    renderSnapshot(snapshot);
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) {
      showLogin(tr("errors.unauthorized"));
      return;
    }
    updateSseState("offline");
    showToast(errorText(error), "error");
  }
}

function openEvents() {
  closeEvents();
  updateSseState("connecting");
  const source = new EventSource(API.events);
  state.eventSource = source;
  source.addEventListener("open", () => updateSseState("online"));
  source.addEventListener("snapshot", (event) => {
    try {
      renderSnapshot(JSON.parse(event.data));
      updateSseState("online");
    } catch {
      showToast(tr("errors.generic"), "error");
    }
  });
  source.onerror = () => {
    updateSseState("reconnecting");
    verifySessionAfterSseError();
  };
}

function closeEvents() {
  if (state.eventSource) {
    state.eventSource.close();
    state.eventSource = null;
  }
}

async function verifySessionAfterSseError() {
  if (state.sessionCheckPending) {
    return;
  }
  state.sessionCheckPending = true;
  await new Promise((resolve) => setTimeout(resolve, 1200));
  try {
    const session = await api(API.session);
    if (session?.auth_required && !session?.authenticated) {
      state.session = {
        auth_required: true,
        authenticated: false,
        username: null,
        csrf_token: null,
      };
      showLogin(tr("errors.unauthorized"));
    }
  } catch {
    updateSseState("offline");
  } finally {
    state.sessionCheckPending = false;
  }
}

function updateSseState(next) {
  state.sseState = next;
  const key =
    next === "online"
      ? "connection.online"
      : next === "offline"
        ? "connection.offline"
        : next === "reconnecting"
          ? "connection.reconnecting"
          : "connection.connecting";
  const className =
    next === "online" ? "is-online" : next === "offline" ? "is-offline" : "is-connecting";
  setText("#sidebar-connection-text", tr(key));
  $("#sidebar-connection-dot").className = `connection-dot ${className}`;
}

function signatureChanged(name, value, force = false) {
  const signature = JSON.stringify(value);
  if (!force && state.renderSignatures.get(name) === signature) {
    return false;
  }
  state.renderSignatures.set(name, signature);
  return true;
}

function renderSnapshot(snapshot, force = false) {
  if (!snapshot || typeof snapshot !== "object") {
    return;
  }
  notifyNewActivity(snapshot.activity || []);
  state.snapshot = snapshot;

  renderService(snapshot, force);
  if (signatureChanged("account", snapshot.account, force)) {
    renderAccount(snapshot.account || {});
  }
  if (signatureChanged("active_drop", snapshot.active_drop, force)) {
    renderActiveDrop(snapshot.active_drop);
  }
  if (signatureChanged("channels", snapshot.channels, force)) {
    renderChannels(snapshot.channels || []);
  }
  if (signatureChanged("campaigns", [snapshot.campaigns, snapshot.settings?.exclude], force)) {
    renderCampaigns();
  }
  if (signatureChanged("connections", snapshot.connections, force)) {
    renderConnections(snapshot.connections || []);
  }
  if (signatureChanged("activity", snapshot.activity, force)) {
    renderActivity();
  }
  if (signatureChanged("games", snapshot.games, force)) {
    renderGames(snapshot.games || []);
  }
  if (!state.settingsDirty && signatureChanged("settings", snapshot.settings, force)) {
    loadSettingsDraft(snapshot.settings || {});
  }
}

function renderService(snapshot, force) {
  const service = snapshot.service || {};
  const serviceSlice = {
    service,
    revision: snapshot.revision,
    generated_at: snapshot.generated_at,
  };
  if (!signatureChanged("service", serviceSlice, force)) {
    return;
  }

  const healthy = Boolean(service.ready && service.running && !service.error);
  const starting = Boolean(service.ready && !service.error && !service.running);
  const pillClass = healthy ? "is-online" : service.error ? "is-offline" : "is-connecting";
  $("#service-pill-dot").className = `status-dot ${pillClass}`;
  const statusText = service.status || (healthy ? tr("service.running") : starting ? tr("service.starting") : tr("service.stopped"));
  setText("#service-pill-text", statusText);
  setText("#metric-service-status", statusText);
  setText("#metric-uptime", formatDuration(service.uptime_seconds));
  setText("#sidebar-version", service.version ? `v${service.version}` : "v—");
  setText(
    "#overview-generated-at",
    snapshot.generated_at
      ? tr("overview.updated", { time: formatDate(snapshot.generated_at, { timeOnly: true }) })
      : "—",
  );
  const error = $("#service-error");
  error.hidden = !service.error;
  setText("#service-error-text", service.error || "");
  renderRuntimeDetails(snapshot);
}

function renderAccount(account) {
  const activation = account.activation && typeof account.activation === "object" ? account.activation : null;
  const connected = Boolean(account.user_id || account.token_available);
  setText("#metric-account-status", account.status || (connected ? tr("account.connected") : tr("account.waiting")));
  setText(
    "#metric-user-id",
    account.user_id ? tr("account.userId", { id: account.user_id }) : tr("common.none"),
  );

  const container = $("#account-content");
  container.replaceChildren();
  const summary = node("div", "account-summary");
  const row = node("div", "account-status-row");
  const statusDot = node("span", `status-dot ${connected ? "is-online" : "is-connecting"}`);
  statusDot.setAttribute("aria-hidden", "true");
  row.append(statusDot, node("strong", "", account.status || (connected ? tr("account.connected") : tr("account.waiting"))));
  summary.append(row);

  if (account.user_id) {
    summary.append(node("p", "muted tabular", tr("account.userId", { id: account.user_id })));
  }

  if (activation?.code) {
    const box = node("div", "activation-box");
    const inner = node("div", "activation-inner");
    inner.append(
      node("strong", "", tr("account.activationTitle")),
      node("p", "muted", tr("account.activationBody")),
      node("code", "activation-code mono", activation.code),
    );
    const actions = node("div", "activation-actions");
    const copyButton = makeButton(tr("account.copyCode"), "button button-secondary");
    copyButton.addEventListener("click", () => copyText(activation.code, tr("account.codeCopied")));
    const url = safeHttpsUrl(activation.url);
    if (url) {
      const link = node("a", "button button-primary", tr("account.openTwitch"));
      link.href = url;
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      actions.append(copyButton, link);
    } else {
      actions.append(copyButton);
    }
    inner.append(actions);
    box.append(inner);
    summary.append(box);
  } else if (!connected) {
    summary.append(node("p", "muted", tr("account.noCode")));
  }
  container.append(summary);

  const disconnect = $("#disconnect-twitch");
  disconnect.disabled = !account.token_available;
}

function renderActiveDrop(drop) {
  const container = $("#active-drop-content");
  container.replaceChildren();
  state.dropCountdown = null;
  if (!drop) {
    $("#active-drop-state").className = "badge badge-neutral";
    setText("#active-drop-state", tr("common.none"));
    const empty = node("div", "empty-state");
    const icon = node("span", "empty-icon", "◌");
    icon.setAttribute("aria-hidden", "true");
    empty.append(
      icon,
      node("strong", "", tr("overview.noDrop")),
      node("p", "", tr("overview.noDropBody")),
    );
    container.append(empty);
    document.title = "Twitch Drops Miner";
    return;
  }

  $("#active-drop-state").className = "badge badge-positive";
  setText("#active-drop-state", tr("channels.watching"));
  const summary = node("div", "drop-summary");
  const names = node("div", "drop-names");
  names.append(
    labeledValue(tr("overview.drop"), drop.name || "—"),
    labeledValue(tr("overview.game"), drop.game || "—"),
    labeledValue(tr("overview.campaign"), drop.campaign || "—"),
  );
  summary.append(names);
  if (Array.isArray(drop.rewards) && drop.rewards.length) {
    summary.append(labeledValue(tr("overview.rewards"), drop.rewards.join(", ")));
  }
  summary.append(
    progressGroup({
      label: tr("overview.dropProgress"),
      value: ratio(drop.drop_progress),
      remainingId: "drop-remaining-time",
      remainingSeconds: drop.drop_remaining_seconds,
      anchor: drop.countdown_anchor,
    }),
    progressGroup({
      label: tr("overview.campaignProgress"),
      value: ratio(drop.campaign_progress),
      remainingId: "campaign-remaining-time",
      remainingSeconds: drop.campaign_remaining_seconds,
      anchor: drop.countdown_anchor,
      detail: tr("overview.claimed", {
        claimed: drop.campaign_claimed ?? 0,
        total: drop.campaign_total ?? 0,
      }),
    }),
  );
  container.append(summary);
  state.dropCountdown = {
    anchorMs: Date.parse(drop.countdown_anchor) || Date.now(),
    dropSeconds: finiteNumber(drop.drop_remaining_seconds),
    campaignSeconds: finiteNumber(drop.campaign_remaining_seconds),
  };
  tickCountdown();
  document.title = drop.game ? `${drop.game} · Twitch Drops Miner` : "Twitch Drops Miner";
}

function labeledValue(label, value) {
  const block = node("div", "drop-name-block");
  block.append(node("span", "", label), node("strong", "", value || "—"));
  return block;
}

function progressGroup({ label, value, remainingId, remainingSeconds, detail = "" }) {
  const group = node("div", "progress-group");
  const meta = node("div", "progress-meta");
  const left = node("strong", "", label);
  const right = node("span", "tabular");
  const percent = formatPercent(value);
  right.textContent = detail ? `${percent} · ${detail}` : percent;
  meta.append(left, right);
  const progress = node("progress");
  progress.max = 1;
  progress.value = value;
  progress.setAttribute("aria-label", label);
  progress.setAttribute("aria-valuemin", "0");
  progress.setAttribute("aria-valuemax", "100");
  progress.setAttribute("aria-valuenow", String(Math.round(value * 100)));
  const remaining = node(
    "span",
    "muted tabular",
    tr("overview.remaining", { time: formatDuration(remainingSeconds) }),
  );
  remaining.id = remainingId;
  group.append(meta, progress, remaining);
  return group;
}

function tickCountdown() {
  if (!state.dropCountdown) {
    return;
  }
  const elapsed = Math.max(0, Math.floor((Date.now() - state.dropCountdown.anchorMs) / 1000));
  const dropSeconds = Math.max(0, state.dropCountdown.dropSeconds - elapsed);
  const campaignSeconds = Math.max(0, state.dropCountdown.campaignSeconds - elapsed);
  setText("#drop-remaining-time", tr("overview.remaining", { time: formatDuration(dropSeconds) }));
  setText(
    "#campaign-remaining-time",
    tr("overview.remaining", { time: formatDuration(campaignSeconds) }),
  );
}

function renderChannels(channels) {
  const body = $("#channels-body");
  const cards = $("#channel-cards");
  body.replaceChildren();
  cards.replaceChildren();
  setText("#channels-count", channels.length);
  $("#channels-empty").hidden = channels.length > 0;

  channels.forEach((channel) => {
    body.append(renderChannelRow(channel));
    cards.append(renderChannelCard(channel));
  });
}

function renderChannelRow(channel) {
  const row = node("tr", channel.watching ? "is-watching" : "");
  const nameCell = node("td");
  const nameWrap = node("div", "channel-name");
  if (channel.watching) {
    const mark = node("span", "watching-mark", "▶");
    mark.setAttribute("aria-label", tr("channels.watching"));
    nameWrap.append(mark);
  }
  const url = safeHttpsUrl(channel.url);
  if (url) {
    const link = node("a", "", channel.name || "—");
    link.href = url;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    nameWrap.append(link);
  } else {
    nameWrap.append(node("span", "", channel.name || "—"));
  }
  nameCell.append(nameWrap);
  const statusCell = node("td");
  statusCell.append(channelStatusLabel(channel.status));
  const gameCell = node("td", "", channel.game || "—");
  const dropsCell = node(
    "td",
    "",
    channel.drops_enabled ? tr("channels.enabled") : tr("channels.disabled"),
  );
  const viewersCell = node(
    "td",
    "align-right tabular",
    channel.viewers == null ? "—" : formatNumber(channel.viewers),
  );
  const sourceCell = node(
    "td",
    "",
    channel.acl_based ? tr("channels.acl") : tr("channels.directory"),
  );
  const actionCell = node("td", "align-right");
  actionCell.append(channelSwitchButton(channel));
  row.append(
    nameCell,
    statusCell,
    gameCell,
    dropsCell,
    viewersCell,
    sourceCell,
    actionCell,
  );
  return row;
}

function renderChannelCard(channel) {
  const card = node("article", `channel-card${channel.watching ? " is-watching" : ""}`);
  const heading = node("div", "channel-card-heading");
  const name = node("strong", "", channel.name || "—");
  heading.append(name, channelStatusLabel(channel.status));
  const meta = node("div", "channel-card-meta");
  meta.append(
    node("span", "", channel.game || "—"),
    node(
      "span",
      "tabular",
      channel.viewers == null ? "—" : formatNumber(channel.viewers),
    ),
  );
  const details = node("div", "channel-card-meta");
  details.append(
    node(
      "span",
      "",
      channel.drops_enabled ? tr("channels.enabled") : tr("channels.disabled"),
    ),
    node("span", "", channel.acl_based ? tr("channels.acl") : tr("channels.directory")),
  );
  card.append(heading, meta, details, channelSwitchButton(channel));
  return card;
}

function channelStatusLabel(status) {
  const normalized = ["online", "pending", "offline"].includes(status) ? status : "offline";
  const label = node("span", `status-label is-${normalized}`, tr(`channels.${normalized}`));
  return label;
}

function channelSwitchButton(channel) {
  const button = makeButton(
    channel.selected && !channel.watching
      ? tr("actions.switching")
      : channel.watching
        ? tr("channels.watching")
        : tr("actions.switch"),
    "button button-secondary table-action",
  );
  button.disabled = Boolean(channel.watching || channel.status !== "online");
  button.addEventListener("click", () => switchChannel(channel.id, button));
  return button;
}

function renderCampaigns() {
  if (!state.snapshot) {
    return;
  }
  const campaigns = Array.isArray(state.snapshot.campaigns) ? state.snapshot.campaigns : [];
  const excluded = new Set(state.snapshot.settings?.exclude || []);
  const query = $("#campaign-search").value.trim().toLocaleLowerCase();
  const statusAllowed = {
    active: $("#filter-active").checked,
    upcoming: $("#filter-upcoming").checked,
    expired: $("#filter-expired").checked,
  };
  const showUnlinked = $("#filter-unlinked").checked;
  const showExcluded = $("#filter-excluded").checked;
  const showFinished = $("#filter-finished").checked;

  const visible = campaigns.filter((campaign) => {
    const status = ["active", "upcoming", "expired"].includes(campaign.status)
      ? campaign.status
      : "expired";
    if (!statusAllowed[status]) {
      return false;
    }
    if (!showUnlinked && !campaign.linked) {
      return false;
    }
    if (!showExcluded && excluded.has(campaign.game)) {
      return false;
    }
    if (!showFinished && campaign.finished) {
      return false;
    }
    if (
      query &&
      !`${campaign.name || ""} ${campaign.game || ""}`.toLocaleLowerCase().includes(query)
    ) {
      return false;
    }
    return true;
  });

  setText(
    "#campaign-result-count",
    tr("campaigns.resultCount", { visible: visible.length, total: campaigns.length }),
  );
  const list = $("#campaign-list");
  list.replaceChildren(...visible.slice(0, 200).map((campaign, index) => campaignCard(campaign, excluded, index)));
  $("#campaigns-empty").hidden = visible.length > 0;
}

function campaignCard(campaign, excludedGames, index) {
  const article = node("article", "campaign-card");
  const inner = node("div", "campaign-card-inner");
  const header = node("div", "campaign-header");
  const imageUrl = safeHttpsUrl(campaign.image_url);
  if (imageUrl) {
    const image = node("img", "campaign-image");
    image.src = imageUrl;
    image.alt = campaign.game || campaign.name || tr("campaigns.title");
    image.loading = "lazy";
    image.decoding = "async";
    image.referrerPolicy = "no-referrer";
    header.append(image);
  } else {
    const placeholder = node("div", "campaign-image-placeholder", "◇");
    placeholder.setAttribute("aria-hidden", "true");
    header.append(placeholder);
  }

  const titleWrap = node("div", "campaign-title-wrap");
  const badges = node("div", "campaign-badges");
  badges.append(statusBadge(campaign.status));
  if (campaign.linked) {
    badges.append(badge(tr("campaigns.linked"), "positive"));
  }
  if (campaign.finished) {
    badges.append(badge(tr("campaigns.finished"), "neutral"));
  }
  if (excludedGames.has(campaign.game)) {
    badges.append(badge(tr("campaigns.excluded"), "danger"));
  }
  const title = node("h2", "", campaign.name || "—");
  title.id = `campaign-title-${index}`;
  const linkUrl = safeHttpsUrl(campaign.link_url);
  if (linkUrl) {
    const link = node("a", "", campaign.name || "—");
    link.href = linkUrl;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    title.replaceChildren(link);
  }
  titleWrap.append(badges, title, node("p", "", campaign.game || "—"));
  header.append(titleWrap);
  inner.append(header);

  const details = node("dl", "campaign-details");
  details.append(
    detail(tr("campaigns.starts"), formatDate(campaign.starts_at)),
    detail(tr("campaigns.ends"), formatDate(campaign.ends_at)),
    detail(
      tr("campaigns.allowedChannels"),
      Array.isArray(campaign.allowed_channels) && campaign.allowed_channels.length
        ? campaign.allowed_channels.join(", ")
        : tr("campaigns.allChannels"),
    ),
    detail(
      tr("campaigns.progress"),
      `${formatPercent(ratio(campaign.progress))} · ${tr("campaigns.dropCount", {
        claimed: campaign.claimed_drops ?? 0,
        total: campaign.total_drops ?? 0,
      })}`,
    ),
  );
  inner.append(details);

  const campaignProgress = node("progress");
  campaignProgress.max = 1;
  campaignProgress.value = ratio(campaign.progress);
  campaignProgress.setAttribute("aria-label", tr("campaigns.progress"));
  inner.append(campaignProgress);

  const drops = Array.isArray(campaign.drops) ? campaign.drops : [];
  if (drops.length) {
    const dropList = node("div", "drop-list");
    drops.slice(0, 8).forEach((drop) => dropList.append(campaignDrop(drop)));
    if (drops.length > 8) {
      dropList.append(node("p", "muted", tr("campaigns.moreDrops", { count: drops.length - 8 })));
    }
    inner.append(dropList);
  }
  article.setAttribute("aria-labelledby", title.id);
  article.append(inner);
  return article;
}

function campaignDrop(drop) {
  const wrapper = node("div", "campaign-drop");
  const heading = node("div", "campaign-drop-heading");
  heading.append(node("strong", "", drop.name || rewardNames(drop) || "Drop"));
  const stateBadge = drop.claimed
    ? badge(tr("campaigns.claimed"), "positive")
    : drop.claimable
      ? badge(tr("campaigns.claimable"), "warning")
      : drop.earnable
        ? badge(tr("campaigns.earnable"), "info")
        : badge(tr("campaigns.remaining"), "neutral");
  heading.append(stateBadge);
  const meta = node("div", "progress-meta");
  meta.append(
    node("span", "tabular", `${drop.current_minutes ?? 0}/${drop.required_minutes ?? 0} min`),
    node("span", "tabular", formatPercent(ratio(drop.progress))),
  );
  const progress = node("progress");
  progress.max = 1;
  progress.value = ratio(drop.progress);
  progress.setAttribute("aria-label", drop.name || tr("overview.dropProgress"));
  wrapper.append(heading, meta, progress);
  const rewards = Array.isArray(drop.rewards) ? drop.rewards : [];
  if (rewards.length) {
    const benefits = node("div", "benefit-row");
    rewards.forEach((reward) => {
      const benefit = node("div", "benefit");
      const imageUrl = safeHttpsUrl(reward.image_url);
      if (imageUrl) {
        const image = node("img", "benefit-image");
        image.src = imageUrl;
        image.alt = reward.name || "";
        image.loading = "lazy";
        image.decoding = "async";
        image.referrerPolicy = "no-referrer";
        benefit.append(image);
      }
      benefit.append(node("span", "", reward.name || "—"));
      benefits.append(benefit);
    });
    wrapper.append(benefits);
  }
  return wrapper;
}

function rewardNames(drop) {
  return Array.isArray(drop.rewards)
    ? drop.rewards.map((reward) => reward?.name).filter(Boolean).join(", ")
    : "";
}

function statusBadge(status) {
  const normalized = ["active", "upcoming", "expired"].includes(status) ? status : "expired";
  const tone = normalized === "active" ? "positive" : normalized === "upcoming" ? "warning" : "neutral";
  return badge(tr(`campaigns.${normalized}`), tone);
}

function badge(label, tone = "neutral") {
  return node("span", `badge badge-${tone}`, label);
}

function detail(label, value) {
  const fragment = document.createDocumentFragment();
  fragment.append(node("dt", "", label), node("dd", "", value || "—"));
  return fragment;
}

function renderConnections(connections) {
  const active = connections.filter((connection) => connectionIsActive(connection.status)).length;
  setText("#metric-connection-count", `${active}/${connections.length}`);
  setText(
    "#metric-connection-detail",
    tr("overview.connectionActive", { active, total: connections.length }),
  );

  const list = $("#connections-list");
  list.replaceChildren();
  if (!connections.length) {
    list.append(node("p", "muted", tr("system.noConnections")));
    return;
  }
  connections.forEach((connection) => {
    const row = node("div", "connection-row");
    const copy = node("div");
    copy.append(
      node("strong", "", tr("system.connection", { id: connection.id ?? "—" })),
      node("small", "", connection.status || tr("common.unknown")),
    );
    row.append(copy, badge(tr("system.topics", { count: connection.topics ?? 0 }), connectionIsActive(connection.status) ? "positive" : "neutral"));
    list.append(row);
  });
}

function connectionIsActive(status) {
  const value = String(status || "").toLocaleLowerCase();
  if (!value) {
    return false;
  }
  return (
    (value.includes("connected") && !value.includes("disconnected")) ||
    value.includes("已连接") ||
    value.includes("连接成功")
  );
}

function renderRuntimeDetails(snapshot) {
  const service = snapshot.service || {};
  const list = $("#runtime-details");
  list.replaceChildren(
    detail(tr("system.version"), service.version ? `v${service.version}` : "—"),
    detail(tr("system.status"), service.status || "—"),
    detail(tr("system.ready"), service.ready ? tr("common.yes") : tr("common.no")),
    detail(tr("system.started"), formatDate(service.started_at)),
    detail(tr("system.uptime"), formatDuration(service.uptime_seconds)),
    detail(tr("system.revision"), snapshot.revision ?? "—"),
    detail(tr("system.generated"), formatDate(snapshot.generated_at)),
  );
}

function renderActivity() {
  const activity = Array.isArray(state.snapshot?.activity) ? state.snapshot.activity : [];
  const query = $("#activity-search").value.trim().toLocaleLowerCase();
  const filtered = activity.filter((entry) =>
    `${entry.level || ""} ${entry.message || ""}`.toLocaleLowerCase().includes(query),
  );
  const list = $("#activity-list");
  list.replaceChildren(
    ...filtered.slice(-500).reverse().map((entry) => {
      const item = node("li", "activity-item");
      const level = String(entry.level || "info").toLocaleLowerCase();
      item.append(
        node("time", "activity-time", formatDate(entry.timestamp, { timeOnly: true })),
        node(
          "span",
          `activity-level ${level === "error" ? "is-error" : level === "warning" ? "is-warning" : level === "notification" ? "is-success" : ""}`,
          level,
        ),
        node("span", "activity-message", entry.message || ""),
      );
      return item;
    }),
  );
  $("#activity-empty").hidden = filtered.length > 0;
}

function notifyNewActivity(activity) {
  const keys = new Set(
    activity.map((entry) => `${entry.timestamp || ""}\u0000${entry.level || ""}\u0000${entry.message || ""}`),
  );
  if (state.knownActivityKeys === null) {
    state.knownActivityKeys = keys;
    return;
  }
  if (
    state.browserNotifications &&
    "Notification" in window &&
    Notification.permission === "granted"
  ) {
    activity.forEach((entry) => {
      const key = `${entry.timestamp || ""}\u0000${entry.level || ""}\u0000${entry.message || ""}`;
      if (!state.knownActivityKeys.has(key) && entry.level === "notification") {
        new Notification("Twitch Drops Miner", {
          body: String(entry.message || ""),
          icon: "/favicon.ico",
        });
      }
    });
  }
  state.knownActivityKeys = keys;
}

function renderGames(games) {
  const list = $("#games-list");
  list.replaceChildren();
  games.forEach((game) => {
    const option = node("option");
    option.value = typeof game === "string" ? game : String(game?.name || "");
    if (option.value) {
      list.append(option);
    }
  });
}

function loadSettingsDraft(settings) {
  state.settingsDraft = {
    language: settings.language || "English",
    priority_mode: settings.priority_mode || "PRIORITY_ONLY",
    proxy: settings.proxy || "",
    dark_mode: Boolean(settings.dark_mode),
    connection_quality: Math.min(6, Math.max(1, Number(settings.connection_quality) || 1)),
    enable_badges_emotes: Boolean(settings.enable_badges_emotes),
    available_drops_check: Boolean(settings.available_drops_check),
  };
  state.priorityDraft = uniqueNames(settings.priority || []);
  state.excludeDraft = uniqueNames(settings.exclude || []);
  state.settingsBaseRevision = settings.revision ?? state.snapshot?.revision ?? null;
  state.settingsDirty = false;
  state.settingsSaving = false;

  renderMinerLanguageOptions(settings.languages || [], state.settingsDraft.language);
  $("#setting-language").value = state.settingsDraft.language;
  $("#setting-priority-mode").value = state.settingsDraft.priority_mode;
  $("#setting-proxy").value = state.settingsDraft.proxy;
  $("#setting-dark-mode").checked = state.settingsDraft.dark_mode;
  $("#setting-connection-quality").value = String(state.settingsDraft.connection_quality);
  $("#connection-quality-output").value = `${state.settingsDraft.connection_quality}×`;
  $("#connection-quality-output").textContent = `${state.settingsDraft.connection_quality}×`;
  $("#setting-badges-emotes").checked = state.settingsDraft.enable_badges_emotes;
  $("#setting-available-drops").checked = state.settingsDraft.available_drops_check;
  $("#setting-notifications").checked = state.browserNotifications;
  setText(
    "#proxy-hint",
    settings.proxy_configured ? tr("settings.proxyConfigured") : tr("settings.proxyHint"),
  );
  renderEditableLists();
  updateSettingsState();
  if (!state.themeInitialized) {
    applyTheme(state.settingsDraft.dark_mode ? "dark" : "system");
    state.themeInitialized = true;
  }
}

function renderMinerLanguageOptions(languages, selected) {
  const select = $("#setting-language");
  const values = uniqueNames([...languages, selected].filter(Boolean));
  if (!values.length) {
    return;
  }
  select.replaceChildren(
    ...values.map((language) => {
      const option = node("option", "", language);
      option.value = language;
      return option;
    }),
  );
}

function uniqueNames(values) {
  const seen = new Set();
  const result = [];
  for (const value of Array.isArray(values) ? values : []) {
    if (typeof value !== "string") {
      continue;
    }
    const name = value.trim();
    if (name && !seen.has(name)) {
      seen.add(name);
      result.push(name);
    }
  }
  return result;
}

function markSettingsDirty() {
  if (state.settingsSaving) {
    return;
  }
  state.settingsDirty = true;
  updateSettingsState();
}

function updateSettingsState() {
  const badgeElement = $("#settings-state");
  const saveButton = $("#settings-save");
  if (state.settingsSaving) {
    badgeElement.className = "badge badge-info";
    badgeElement.textContent = tr("settings.saving");
    saveButton.disabled = true;
  } else if (state.settingsDirty) {
    badgeElement.className = "badge badge-warning";
    badgeElement.textContent = tr("settings.unsaved");
    saveButton.disabled = false;
  } else {
    badgeElement.className = "badge badge-neutral";
    badgeElement.textContent = tr("settings.saved");
    saveButton.disabled = true;
  }
  setText(
    "#settings-save-hint",
    state.settingsDirty ? tr("settings.unsavedHint") : tr("settings.saveHint"),
  );
}

function updateSettingsDraftFromForm() {
  if (!state.settingsDraft) {
    return;
  }
  state.settingsDraft.language = $("#setting-language").value;
  state.settingsDraft.priority_mode = $("#setting-priority-mode").value;
  state.settingsDraft.proxy = $("#setting-proxy").value.trim();
  state.settingsDraft.dark_mode = $("#setting-dark-mode").checked;
  state.settingsDraft.connection_quality = Number($("#setting-connection-quality").value);
  state.settingsDraft.enable_badges_emotes = $("#setting-badges-emotes").checked;
  state.settingsDraft.available_drops_check = $("#setting-available-drops").checked;
  $("#connection-quality-output").value = `${state.settingsDraft.connection_quality}×`;
  $("#connection-quality-output").textContent = `${state.settingsDraft.connection_quality}×`;
  markSettingsDirty();
}

function renderEditableLists() {
  renderPriorityList();
  renderExcludeList();
  setText("#priority-count", state.priorityDraft.length);
  setText("#exclude-count", state.excludeDraft.length);
  $("#priority-empty").hidden = state.priorityDraft.length > 0;
  $("#exclude-empty").hidden = state.excludeDraft.length > 0;
}

function renderPriorityList() {
  const list = $("#priority-list");
  list.replaceChildren(
    ...state.priorityDraft.map((name, index) => {
      const item = node("li", "editable-item");
      item.append(node("span", "editable-item-name", name));
      const actions = node("div", "editable-actions");
      actions.append(
        listActionButton("⇈", tr("actions.moveTop"), index === 0, () => movePriority(index, 0)),
        listActionButton("↑", tr("actions.moveUp"), index === 0, () => movePriority(index, index - 1)),
        listActionButton(
          "↓",
          tr("actions.moveDown"),
          index === state.priorityDraft.length - 1,
          () => movePriority(index, index + 1),
        ),
        listActionButton(
          "⇊",
          tr("actions.moveBottom"),
          index === state.priorityDraft.length - 1,
          () => movePriority(index, state.priorityDraft.length - 1),
        ),
        listActionButton("×", tr("actions.remove"), false, () => {
          state.priorityDraft.splice(index, 1);
          renderEditableLists();
          markSettingsDirty();
        }, true),
      );
      item.append(actions);
      return item;
    }),
  );
}

function renderExcludeList() {
  const list = $("#exclude-list");
  list.replaceChildren(
    ...state.excludeDraft.map((name, index) => {
      const item = node("li", "editable-item");
      item.append(node("span", "editable-item-name", name));
      const actions = node("div", "editable-actions");
      actions.append(
        listActionButton("×", tr("actions.remove"), false, () => {
          state.excludeDraft.splice(index, 1);
          renderEditableLists();
          markSettingsDirty();
        }, true),
      );
      item.append(actions);
      return item;
    }),
  );
}

function listActionButton(label, title, disabled, action, danger = false) {
  const button = node(
    "button",
    `list-icon-button${danger ? " is-delete" : ""}`,
    label,
  );
  button.type = "button";
  button.disabled = disabled;
  button.setAttribute("aria-label", title);
  button.setAttribute("title", title);
  button.addEventListener("click", action);
  return button;
}

function movePriority(from, to) {
  if (from === to || to < 0 || to >= state.priorityDraft.length) {
    return;
  }
  const [item] = state.priorityDraft.splice(from, 1);
  state.priorityDraft.splice(to, 0, item);
  renderEditableLists();
  markSettingsDirty();
}

function addGameToList(kind) {
  const input = kind === "priority" ? $("#priority-input") : $("#exclude-input");
  const list = kind === "priority" ? state.priorityDraft : state.excludeDraft;
  const name = input.value.trim();
  if (!name || name.length > 120) {
    showToast(tr("settings.invalidGame"), "error");
    input.focus();
    return;
  }
  if (list.includes(name)) {
    showToast(tr("settings.duplicate"), "error");
    input.select();
    return;
  }
  list.push(name);
  if (kind === "exclude") {
    list.sort((left, right) => left.localeCompare(right, state.locale));
  }
  input.value = "";
  renderEditableLists();
  markSettingsDirty();
}

async function saveSettings(event) {
  event.preventDefault();
  if (!state.settingsDraft || !state.settingsDirty || state.settingsSaving) {
    return;
  }
  updateSettingsDraftFromForm();
  state.settingsSaving = true;
  updateSettingsState();
  try {
    const snapshot = await api(API.settings, {
      method: "PATCH",
      headers:
        state.settingsBaseRevision == null
          ? {}
          : { "If-Match": `"${state.settingsBaseRevision}"` },
      body: {
        ...state.settingsDraft,
        priority: [...state.priorityDraft],
        exclude: [...state.excludeDraft],
      },
    });
    state.settingsDirty = false;
    state.settingsSaving = false;
    state.renderSignatures.delete("settings");
    renderSnapshot(snapshot, true);
    showToast(tr("settings.savedToast"), "success");
  } catch (error) {
    state.settingsSaving = false;
    if (error instanceof ApiError && error.code === "revision_conflict") {
      state.settingsDirty = false;
      await loadSnapshot();
      showToast(tr("settings.conflict"), "error");
    } else {
      showToast(errorText(error), "error");
    }
    updateSettingsState();
  }
}

async function toggleBrowserNotifications(event) {
  const requested = event.currentTarget.checked;
  if (!requested) {
    state.browserNotifications = false;
    localStorage.setItem("tdm.notifications", "0");
    return;
  }
  if (!("Notification" in window)) {
    event.currentTarget.checked = false;
    showToast(tr("settings.notificationDenied"), "error");
    return;
  }
  const permission = await Notification.requestPermission();
  state.browserNotifications = permission === "granted";
  event.currentTarget.checked = state.browserNotifications;
  localStorage.setItem("tdm.notifications", state.browserNotifications ? "1" : "0");
  if (!state.browserNotifications) {
    showToast(tr("settings.notificationDenied"), "error");
  }
}

async function refreshInventory(button) {
  await runButtonAction(button, async () => {
    await api(API.inventoryRefresh, { method: "POST" });
    showToast(tr("actions.refreshAccepted"), "success");
  });
}

async function switchChannel(channelId, button) {
  await runButtonAction(button, async () => {
    await api(API.channelSwitch(channelId), { method: "POST" });
    showToast(tr("actions.switchAccepted"), "success");
  });
}

async function restartBackend(button) {
  await runButtonAction(button, async () => {
    await api(API.restart, { method: "POST" });
    showToast(tr("actions.restartAccepted"), "success");
  });
}

async function disconnectTwitch(button) {
  await runButtonAction(button, async () => {
    await api(API.revokeToken, { method: "DELETE" });
    showToast(tr("actions.disconnectAccepted"), "success");
  });
}

async function runButtonAction(button, action) {
  const previousDisabled = button.disabled;
  button.disabled = true;
  button.setAttribute("aria-busy", "true");
  try {
    await action();
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) {
      showLogin(tr("errors.unauthorized"));
    } else {
      showToast(errorText(error), "error");
    }
  } finally {
    button.disabled = previousDisabled;
    button.removeAttribute("aria-busy");
  }
}

function openConfirm({ title, body, confirmLabel, action }) {
  const dialog = $("#confirm-dialog");
  setText("#confirm-title", title);
  setText("#confirm-body", body);
  setText("#confirm-accept", confirmLabel);
  state.confirmAction = action;
  dialog.showModal();
}

async function handleConfirmClose() {
  const dialog = $("#confirm-dialog");
  if (dialog.returnValue !== "confirm" || !state.confirmAction) {
    state.confirmAction = null;
    return;
  }
  const action = state.confirmAction;
  state.confirmAction = null;
  await action($("#confirm-accept"));
}

async function managementLogin(event) {
  event.preventDefault();
  const submit = $("#login-submit");
  const username = $("#login-username").value.trim();
  const password = $("#login-password").value;
  const error = $("#login-error");
  error.hidden = true;
  submit.disabled = true;
  submit.setAttribute("aria-busy", "true");
  const label = $("[data-i18n='login.submit']", submit);
  if (label) {
    label.textContent = tr("login.signingIn");
  }
  try {
    const session = await api(API.login, {
      method: "POST",
      body: { username, password },
    });
    state.session = {
      auth_required: true,
      authenticated: true,
      username: session?.username || username,
      csrf_token: session?.csrf_token || null,
    };
    $("#login-password").value = "";
    showApp();
    await loadSnapshot();
    openEvents();
  } catch (apiError) {
    error.textContent = errorText(apiError);
    error.hidden = false;
    $("#login-password").select();
  } finally {
    submit.disabled = false;
    submit.removeAttribute("aria-busy");
    if (label) {
      label.textContent = tr("login.submit");
    }
  }
}

async function managementLogout() {
  const button = $("#management-logout");
  await runButtonAction(button, async () => {
    await api(API.logout, { method: "POST" });
    state.session = {
      auth_required: true,
      authenticated: false,
      username: null,
      csrf_token: null,
    };
    showLogin();
  });
}

function makeButton(label, className) {
  const button = node("button", className, label);
  button.type = "button";
  return button;
}

function safeHttpsUrl(value) {
  if (typeof value !== "string" || !value) {
    return "";
  }
  try {
    const url = new URL(value);
    return url.protocol === "https:" ? url.href : "";
  } catch {
    return "";
  }
}

function ratio(value) {
  const number = finiteNumber(value);
  if (number <= 0) {
    return 0;
  }
  return Math.min(1, number > 1 ? number / 100 : number);
}

function finiteNumber(value) {
  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
}

function formatPercent(value) {
  return new Intl.NumberFormat(state.locale, {
    style: "percent",
    maximumFractionDigits: 1,
  }).format(Math.min(1, Math.max(0, finiteNumber(value))));
}

function formatNumber(value) {
  return new Intl.NumberFormat(state.locale, {
    maximumFractionDigits: 0,
  }).format(finiteNumber(value));
}

function formatDuration(value) {
  let seconds = Math.max(0, Math.floor(finiteNumber(value)));
  const days = Math.floor(seconds / 86400);
  seconds %= 86400;
  const hours = Math.floor(seconds / 3600);
  seconds %= 3600;
  const minutes = Math.floor(seconds / 60);
  seconds %= 60;
  const time = [hours + days * 24, minutes, seconds]
    .map((part) => String(part).padStart(2, "0"))
    .join(":");
  return time;
}

function formatDate(value, { timeOnly = false } = {}) {
  if (!value) {
    return "—";
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return String(value);
  }
  return new Intl.DateTimeFormat(
    state.locale,
    timeOnly
      ? { hour: "2-digit", minute: "2-digit", second: "2-digit" }
      : {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
        },
  ).format(date);
}

async function copyText(value, successMessage = tr("common.copied")) {
  const text = String(value || "");
  try {
    await navigator.clipboard.writeText(text);
    showToast(successMessage, "success");
  } catch {
    const textarea = node("textarea");
    textarea.value = text;
    textarea.setAttribute("readonly", "");
    textarea.className = "sr-only";
    document.body.append(textarea);
    textarea.select();
    document.execCommand("copy");
    textarea.remove();
    showToast(successMessage, "success");
  }
}

function copyActivity() {
  const activity = Array.isArray(state.snapshot?.activity) ? state.snapshot.activity : [];
  const lines = activity.map(
    (entry) => `${entry.timestamp || ""} [${entry.level || "info"}] ${entry.message || ""}`,
  );
  copyText(lines.join("\n"), tr("system.logsCopied"));
}

function showToast(message, tone = "info") {
  const toast = node("div", `toast is-${tone}`, message);
  toast.setAttribute("role", tone === "error" ? "alert" : "status");
  $("#toast-region").append(toast);
  window.setTimeout(() => {
    toast.classList.add("is-leaving");
    window.setTimeout(() => toast.remove(), 180);
  }, 3800);
}

function bindEvents() {
  $("#login-form").addEventListener("submit", managementLogin);
  $("#login-language").addEventListener("change", (event) => setLocale(event.currentTarget.value));
  $("#app-language").addEventListener("change", (event) => setLocale(event.currentTarget.value));
  $("#theme-toggle").addEventListener("click", cycleTheme);
  $("#management-logout").addEventListener("click", managementLogout);

  $$("[data-view]").forEach((button) => {
    button.addEventListener("click", () => setView(button.dataset.view));
  });
  window.addEventListener("hashchange", () => {
    setView(location.hash.slice(1), { focus: true, updateHash: false });
  });

  $("#overview-refresh").addEventListener("click", (event) => refreshInventory(event.currentTarget));
  $("#campaigns-refresh").addEventListener("click", (event) => refreshInventory(event.currentTarget));
  $("#campaign-search").addEventListener("input", renderCampaigns);
  [
    "#filter-active",
    "#filter-upcoming",
    "#filter-expired",
    "#filter-unlinked",
    "#filter-excluded",
    "#filter-finished",
  ].forEach((selector) => $(selector).addEventListener("change", renderCampaigns));

  $("#settings-form").addEventListener("submit", saveSettings);
  [
    "#setting-language",
    "#setting-priority-mode",
    "#setting-proxy",
    "#setting-dark-mode",
    "#setting-connection-quality",
    "#setting-badges-emotes",
    "#setting-available-drops",
  ].forEach((selector) => {
    $(selector).addEventListener(
      selector === "#setting-connection-quality" || selector === "#setting-proxy"
        ? "input"
        : "change",
      updateSettingsDraftFromForm,
    );
  });
  $("#setting-notifications").addEventListener("change", toggleBrowserNotifications);
  $("#priority-add").addEventListener("click", () => addGameToList("priority"));
  $("#exclude-add").addEventListener("click", () => addGameToList("exclude"));
  $("#priority-input").addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      addGameToList("priority");
    }
  });
  $("#exclude-input").addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      addGameToList("exclude");
    }
  });

  $("#activity-search").addEventListener("input", renderActivity);
  $("#copy-activity").addEventListener("click", copyActivity);
  $("#restart-service").addEventListener("click", () => {
    openConfirm({
      title: tr("system.restartConfirmTitle"),
      body: tr("system.restartConfirmBody"),
      confirmLabel: tr("actions.restart"),
      action: restartBackend,
    });
  });
  $("#disconnect-twitch").addEventListener("click", () => {
    openConfirm({
      title: tr("system.disconnectConfirmTitle"),
      body: tr("system.disconnectConfirmBody"),
      confirmLabel: tr("actions.disconnect"),
      action: disconnectTwitch,
    });
  });
  $("#confirm-dialog").addEventListener("close", handleConfirmClose);

  document.addEventListener("visibilitychange", () => {
    if (!document.hidden) {
      tickCountdown();
    }
  });
}

async function init() {
  bindEvents();
  applyTheme(state.theme);
  applyTranslations();
  setView(state.currentView, { focus: false, updateHash: true });
  await loadSession();
  window.setInterval(tickCountdown, 1000);
}

init();
