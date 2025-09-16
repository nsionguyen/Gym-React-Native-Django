"use client"

import { useState, useEffect, useContext } from "react"
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
  Alert,
  ActivityIndicator,
  StyleSheet,
  Dimensions,
  StatusBar,
} from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { authApis, endpoints } from "../../configs/Apis"
import { MyUserContext } from "../../configs/MyContexts"

const { width } = Dimensions.get("window")

const PTSchedule = ({ navigation }) => {
  const user = useContext(MyUserContext)
  const [schedules, setSchedules] = useState([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [selectedFilter, setSelectedFilter] = useState("all")
  const [updatingSchedule, setUpdatingSchedule] = useState(null)

  // ✅ Sửa lại status filters để khớp với Django model
  const statusFilters = [
    { key: "all", label: "Tất cả", color: "#666" },
    { key: "pending", label: "Chờ duyệt", color: "#f39c12" },
    { key: "approved", label: "Đã duyệt", color: "#27ae60" }, // ✅ confirmed → approved
    { key: "rejected", label: "Đã từ chối", color: "#e74c3c" }, // ✅ cancelled → rejected
    { key: "completed", label: "Hoàn thành", color: "#3498db" },
  ]

  const fetchSchedules = async () => {
    if (!user || !user.access_token) {
      setLoading(false)
      return
    }

    try {
      const api = authApis(user.access_token)
      const response = await api.get(endpoints["schedules"])



      // Sắp xếp theo thời gian tạo mới nhất
      const sortedSchedules = (response.data?.results || response.data || []).sort(
        (a, b) => new Date(b.created_at) - new Date(a.created_at),
      )

      setSchedules(sortedSchedules)
    } catch (error) {
      console.error("❌ Error fetching schedules:", error)
      Alert.alert("Lỗi", "Không thể tải danh sách lịch tập")
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    fetchSchedules()
  }, [user])

  const onRefresh = () => {
    setRefreshing(true)
    fetchSchedules()
  }

  const updateScheduleStatus = async (scheduleId, newStatus) => {
    if (!user || !user.access_token) return

    try {
      setUpdatingSchedule(scheduleId)
      const api = authApis(user.access_token)



      // ✅ Chỉ gửi status, không cần các field khác
      const payload = {
        status: newStatus,
      }



      const response = await api.patch(`${endpoints["schedules"]}${scheduleId}/`, payload)



      // Cập nhật local state
      setSchedules((prevSchedules) =>
        prevSchedules.map((schedule) =>
          schedule.id === scheduleId
            ? { ...schedule, status: newStatus, updated_at: new Date().toISOString() }
            : schedule,
        ),
      )

      // ✅ Sửa lại status text
      const statusText = {
        approved: "duyệt",
        rejected: "từ chối",
        completed: "hoàn thành",
      }[newStatus]

      Alert.alert("Thành công", `Đã ${statusText} lịch tập thành công!`)
    } catch (error) {
      console.error("❌ Error updating schedule:", error)
      console.error("❌ Error response:", error.response?.data)
      console.error("❌ Error status:", error.response?.status)

      let errorMessage = "Không thể cập nhật trạng thái lịch tập"

      if (error.response?.data) {
        const errorData = error.response.data
        if (typeof errorData === "object") {
          const errorFields = Object.keys(errorData)
            .map((key) => `${key}: ${Array.isArray(errorData[key]) ? errorData[key].join(", ") : errorData[key]}`)
            .join("\n")
          errorMessage = `Lỗi validation:\n${errorFields}`
        } else {
          errorMessage = `Lỗi: ${errorData}`
        }
      }

      Alert.alert("Lỗi", errorMessage)
    } finally {
      setUpdatingSchedule(null)
    }
  }

  // ✅ Sửa lại confirmAction để dùng đúng status values
  const confirmAction = (scheduleId, action, memberName) => {
    const actionText = {
      approved: "duyệt",
      rejected: "từ chối",
      completed: "đánh dấu hoàn thành",
    }[action]

    Alert.alert("Xác nhận", `Bạn có chắc chắn muốn ${actionText} lịch tập của ${memberName}?`, [
      { text: "Hủy", style: "cancel" },
      {
        text: "Xác nhận",
        onPress: () => updateScheduleStatus(scheduleId, action),
        style: action === "rejected" ? "destructive" : "default", // ✅ cancelled → rejected
      },
    ])
  }

  const getFilteredSchedules = () => {
    if (selectedFilter === "all") {
      return schedules
    }
    return schedules.filter((schedule) => schedule.status === selectedFilter)
  }

  // ✅ Sửa lại getStatusColor để khớp với Django status
  const getStatusColor = (status) => {
    const statusColors = {
      pending: "#f39c12",
      approved: "#27ae60", // ✅ confirmed → approved
      rejected: "#e74c3c", // ✅ cancelled → rejected
      completed: "#3498db",
    }
    return statusColors[status] || "#666"
  }

  // ✅ Sửa lại getStatusText để khớp với Django status
  const getStatusText = (status) => {
    const statusTexts = {
      pending: "Chờ duyệt",
      approved: "Đã duyệt", // ✅ confirmed → approved
      rejected: "Đã từ chối", // ✅ cancelled → rejected
      completed: "Hoàn thành",
    }
    return statusTexts[status] || status
  }

  const formatDateTime = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleString("vi-VN", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const formatDuration = (startTime, endTime) => {
    const start = new Date(startTime)
    const end = new Date(endTime)
    const duration = Math.round((end - start) / (1000 * 60))
    return `${duration} phút`
  }

  const renderScheduleCard = (schedule) => {
    const isUpdating = updatingSchedule === schedule.id
    const canApprove = schedule.status === "pending"
    const canComplete = schedule.status === "approved" // ✅ confirmed → approved

    return (
      <View key={schedule.id} style={styles.scheduleCard}>
        {/* Header */}
        <View style={styles.cardHeader}>
          <View style={styles.memberInfo}>
            <View style={styles.memberAvatar}>
              <Text style={styles.memberAvatarText}>{schedule.user?.email?.[0]?.toUpperCase() || "U"}</Text>
            </View>
            <View style={styles.memberDetails}>
              <Text style={styles.memberName}>{schedule.user?.email || "Không xác định"}</Text>
              <Text style={styles.memberRole}>Hội viên</Text>
            </View>
          </View>

          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(schedule.status) }]}>
            <Text style={styles.statusText}>{getStatusText(schedule.status)}</Text>
          </View>
        </View>

        {/* Time Info */}
        <View style={styles.timeSection}>
          <View style={styles.timeRow}>
            <Ionicons name="calendar-outline" size={16} color="#666" />
            <Text style={styles.timeText}>{formatDateTime(schedule.start_time)}</Text>
          </View>
          <View style={styles.timeRow}>
            <Ionicons name="time-outline" size={16} color="#666" />
            <Text style={styles.timeText}>Thời lượng: {formatDuration(schedule.start_time, schedule.end_time)}</Text>
          </View>
        </View>

        {/* Package Info */}
        {schedule.member_package && (
          <View style={styles.packageSection}>
            <Ionicons name="fitness-outline" size={16} color="#666" />
            <Text style={styles.packageText}>Gói: {schedule.member_package?.package?.name || "Không xác định"}</Text>
          </View>
        )}

        {/* Note */}
        {schedule.note && (
          <View style={styles.noteSection}>
            <Ionicons name="document-text-outline" size={16} color="#666" />
            <Text style={styles.noteText}>{schedule.note}</Text>
          </View>
        )}

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          {canApprove && (
            <>
              <TouchableOpacity
                style={[styles.actionButton, styles.approveButton]}
                onPress={() => confirmAction(schedule.id, "approved", schedule.user?.email)} // ✅ confirmed → approved
                disabled={isUpdating}
              >
                {isUpdating ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Ionicons name="checkmark-circle" size={20} color="#fff" />
                )}
                <Text style={styles.actionButtonText}>Duyệt</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.actionButton, styles.rejectButton]}
                onPress={() => confirmAction(schedule.id, "rejected", schedule.user?.email)} // ✅ cancelled → rejected
                disabled={isUpdating}
              >
                {isUpdating ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Ionicons name="close-circle" size={20} color="#fff" />
                )}
                <Text style={styles.actionButtonText}>Từ chối</Text>
              </TouchableOpacity>
            </>
          )}

          {canComplete && (
            <TouchableOpacity
              style={[styles.actionButton, styles.completeButton]}
              onPress={() => confirmAction(schedule.id, "completed", schedule.user?.email)}
              disabled={isUpdating}
            >
              {isUpdating ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Ionicons name="checkmark-done" size={20} color="#fff" />
              )}
              <Text style={styles.actionButtonText}>Hoàn thành</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Created Time */}
        <View style={styles.createdTime}>
          <Text style={styles.createdTimeText}>Đặt lúc: {formatDateTime(schedule.created_at)}</Text>
        </View>
      </View>
    )
  }

  const filteredSchedules = getFilteredSchedules()

  if (!user || user.role !== "pt") {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle" size={60} color="#e74c3c" />
        <Text style={styles.errorText}>Chỉ PT mới có thể truy cập trang này</Text>
      </View>
    )
  }

  return (
    <>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
              <Ionicons name="chevron-back" size={24} color="#333" />
              <Text style={styles.backButtonText}>Quay lại</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.refreshButton} onPress={onRefresh}>
              <Ionicons name="refresh" size={24} color="#666" />
            </TouchableOpacity>
          </View>

          <View style={styles.headerContent}>
            <Ionicons name="calendar" size={28} color="#FF6B6B" />
            <Text style={styles.headerTitle}>Quản lý lịch tập</Text>
          </View>
          <Text style={styles.headerSubtitle}>Duyệt và quản lý lịch tập của hội viên</Text>
        </View>

        {/* Filter Tabs */}
        <View style={styles.filterContainer}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filterScrollContent}
          >
            {statusFilters.map((filter) => (
              <TouchableOpacity
                key={filter.key}
                style={[styles.filterTab, selectedFilter === filter.key && styles.filterTabActive]}
                onPress={() => setSelectedFilter(filter.key)}
              >
                <Text style={[styles.filterTabText, selectedFilter === filter.key && styles.filterTabTextActive]}>
                  {filter.label}
                </Text>
                {selectedFilter === filter.key && (
                  <View style={[styles.filterTabIndicator, { backgroundColor: filter.color }]} />
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Content */}
        <ScrollView
          style={styles.content}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          showsVerticalScrollIndicator={false}
        >
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#FF6B6B" />
              <Text style={styles.loadingText}>Đang tải danh sách lịch...</Text>
            </View>
          ) : filteredSchedules.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="calendar-outline" size={60} color="#ccc" />
              <Text style={styles.emptyText}>
                {selectedFilter === "all"
                  ? "Chưa có lịch tập nào"
                  : `Không có lịch tập ${statusFilters.find((f) => f.key === selectedFilter)?.label.toLowerCase()}`}
              </Text>
              <TouchableOpacity style={styles.refreshEmptyButton} onPress={onRefresh}>
                <Text style={styles.refreshEmptyButtonText}>Tải lại</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.schedulesList}>{filteredSchedules.map(renderScheduleCard)}</View>
          )}
        </ScrollView>

        {/* Stats Footer - ✅ Sửa lại để khớp với Django status */}
        <View style={styles.statsFooter}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{schedules.filter((s) => s.status === "pending").length}</Text>
            <Text style={styles.statLabel}>Chờ duyệt</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{schedules.filter((s) => s.status === "approved").length}</Text>
            <Text style={styles.statLabel}>Đã duyệt</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{schedules.filter((s) => s.status === "completed").length}</Text>
            <Text style={styles.statLabel}>Hoàn thành</Text>
          </View>
        </View>
      </View>
    </>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  header: {
    backgroundColor: "#fff",
    paddingTop: StatusBar.currentHeight || 40,
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    backgroundColor: "#f5f5f5",
  },
  backButtonText: {
    fontSize: 16,
    color: "#333",
    marginLeft: 4,
    fontWeight: "500",
  },
  refreshButton: {
    padding: 8,
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    marginLeft: 12,
  },
  headerSubtitle: {
    fontSize: 14,
    color: "#666",
    marginLeft: 40,
  },
  filterContainer: {
    backgroundColor: "#fff",
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  filterScrollContent: {
    paddingHorizontal: 20,
  },
  filterTab: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    marginRight: 15,
    borderRadius: 20,
    backgroundColor: "#f5f5f5",
    position: "relative",
  },
  filterTabActive: {
    backgroundColor: "#e3f2fd",
  },
  filterTabText: {
    fontSize: 14,
    color: "#666",
    fontWeight: "500",
  },
  filterTabTextActive: {
    color: "#1976d2",
    fontWeight: "600",
  },
  filterTabIndicator: {
    position: "absolute",
    bottom: -15,
    left: "50%",
    marginLeft: -10,
    width: 20,
    height: 3,
    borderRadius: 2,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 60,
  },
  loadingText: {
    marginTop: 15,
    fontSize: 16,
    color: "#666",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    color: "#666",
    marginTop: 15,
    marginBottom: 20,
    textAlign: "center",
  },
  refreshEmptyButton: {
    backgroundColor: "#FF6B6B",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  refreshEmptyButtonText: {
    color: "#fff",
    fontWeight: "600",
  },
  schedulesList: {
    paddingBottom: 20,
  },
  scheduleCard: {
    backgroundColor: "#fff",
    borderRadius: 15,
    padding: 20,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  memberInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  memberAvatar: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    backgroundColor: "#FF6B6B",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  memberAvatarText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  memberDetails: {
    flex: 1,
  },
  memberName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  memberRole: {
    fontSize: 12,
    color: "#666",
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
  statusText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },
  timeSection: {
    marginBottom: 12,
  },
  timeRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  timeText: {
    fontSize: 14,
    color: "#333",
    marginLeft: 8,
  },
  packageSection: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  packageText: {
    fontSize: 14,
    color: "#333",
    marginLeft: 8,
  },
  noteSection: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 15,
    backgroundColor: "#f8f9fa",
    padding: 10,
    borderRadius: 8,
  },
  noteText: {
    fontSize: 14,
    color: "#666",
    marginLeft: 8,
    flex: 1,
    lineHeight: 20,
  },
  actionButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  actionButton: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 12,
    borderRadius: 10,
    marginHorizontal: 5,
  },
  approveButton: {
    backgroundColor: "#27ae60",
  },
  rejectButton: {
    backgroundColor: "#e74c3c",
  },
  completeButton: {
    backgroundColor: "#3498db",
  },
  actionButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
    marginLeft: 6,
  },
  createdTime: {
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
    paddingTop: 10,
  },
  createdTimeText: {
    fontSize: 12,
    color: "#999",
    textAlign: "center",
  },
  statsFooter: {
    backgroundColor: "#fff",
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: 15,
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
  },
  statItem: {
    alignItems: "center",
  },
  statNumber: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
  },
  statLabel: {
    fontSize: 12,
    color: "#666",
    marginTop: 2,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f8f9fa",
    padding: 40,
  },
  errorText: {
    fontSize: 18,
    color: "#e74c3c",
    marginTop: 15,
    textAlign: "center",
  },
})

export default PTSchedule;