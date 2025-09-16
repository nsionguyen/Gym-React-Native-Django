import { useState, useEffect, useContext } from "react"
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Image,
  Alert,
  ScrollView,
  Dimensions,
  StatusBar,
  ActivityIndicator,
  RefreshControl,
} from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { MyUserContext, MyDispatchContext } from "../../configs/MyContexts"
import Apis, { authApis, endpoints } from "../../configs/Apis";

const { width } = Dimensions.get("window")

const Home = ({ navigation }) => {
  const user = useContext(MyUserContext)
  const dispatch = useContext(MyDispatchContext)
  const [healthInfo, setHealthInfo] = useState(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [nextSchedule, setNextSchedule] = useState(null) // ✅ Thêm state cho lịch tập tiếp theo
  const [loadingSchedule, setLoadingSchedule] = useState(false)
  const [friendName1, setFriendName1] = useState('');
  const userId = user.id;
  // const { runNotificationChecks } = useNotifications()

  // useEffect(() => {
  //   // Chạy kiểm tra thông báo khi vào Home
  //   runNotificationChecks()
  // }, [])
  // ✅ Hàm fetch thông tin sức khỏe

  useEffect(() => {
    if (friendName1) {
      console.log("✅ friendName1 ready:", friendName1);
    }
  }, [friendName1]);

  const fetchHealthInfo = async () => {
    if (!user || !user.access_token) {
      console.log("Chưa có token, không thể gọi API")
      return
    }

    try {
      let res = await Apis.get(endpoints['member-profiles'](userId));

      setHealthInfo(res.data)
    } catch (error) {
      if (error.response?.status === 404) {
        console.warn("Người dùng chưa có hồ sơ sức khỏe")
        setHealthInfo(null)
      } else {
        console.error("Lỗi khi lấy thông tin sức khỏe:", error)
      }
    }
  }

  // ✅ Hàm fetch lịch tập tiếp theo
  const fetchNextSchedule = async () => {
    if (!user || !user.access_token) {
      console.log("Chưa có token, không thể gọi API lịch tập")
      return
    }

    try {
      setLoadingSchedule(true)
      const api = authApis(user.access_token)
      const response = await api.get(endpoints["schedules"])
      const name = response.data[0].pt.first_name;
      setFriendName1(name);







      const schedules = response.data?.results || response.data || []

      // ✅ Lọc lịch đã được duyệt và chưa qua thời gian
      const now = new Date()
      const approvedSchedules = schedules
        .filter((schedule) => {
          // Chỉ lấy lịch đã được duyệt
          if (schedule.status !== "approved") return false

          // Chỉ lấy lịch của user hiện tại
          if (schedule.user?.id !== user.id) return false

          // Chỉ lấy lịch chưa qua thời gian bắt đầu
          const startTime = new Date(schedule.start_time)
          return startTime > now
        })
        .sort((a, b) => new Date(a.start_time) - new Date(b.start_time)) // Sắp xếp theo thời gian



      // Lấy lịch tập tiếp theo (gần nhất)
      if (approvedSchedules.length > 0) {
        const upcoming = approvedSchedules[0]
        setNextSchedule({
          id: upcoming.id,
          date: new Date(upcoming.start_time).toLocaleDateString("vi-VN", {
            weekday: "short",
            day: "2-digit",
            month: "2-digit",
          }),
          time: new Date(upcoming.start_time).toLocaleTimeString("vi-VN", {
            hour: "2-digit",
            minute: "2-digit",
          }),
          endTime: new Date(upcoming.end_time).toLocaleTimeString("vi-VN", {
            hour: "2-digit",
            minute: "2-digit",
          }),
          trainerName: upcoming.pt ? `${upcoming.pt.last_name} ${upcoming.pt.first_name}` : "Tự tập",
          note: upcoming.note,
          packageName: upcoming.member_package?.package?.name,
          startTime: upcoming.start_time,
          endTime: upcoming.end_time,
        })
      } else {
        setNextSchedule(null)
      }
    } catch (error) {
      console.error("❌ Lỗi khi lấy lịch tập:", error)
      setNextSchedule(null)
    } finally {
      setLoadingSchedule(false)
    }
  }

  // ✅ Hàm fetch tất cả dữ liệu
  const fetchAllData = async () => {
    setLoading(true)
    await Promise.all([fetchHealthInfo(), fetchNextSchedule()])
    setLoading(false)
  }

  //  Hàm refresh
  const onRefresh = async () => {
    setRefreshing(true)
    await fetchAllData()
    setRefreshing(false)
  }

  //  Effect để fetch dữ liệu khi component mount
  useEffect(() => {
    if (user && user.access_token) {
      fetchAllData()
    } else {
      setLoading(false)
    }
  }, [user])

  //  Effect để tự động cập nhật lịch mỗi phút (để ẩn lịch đã qua)
  useEffect(() => {
    const interval = setInterval(() => {
      if (nextSchedule) {
        const now = new Date()
        const endTime = new Date(nextSchedule.endTime)

        // Nếu lịch tập đã kết thúc, ẩn đi và fetch lại
        if (now > endTime) {
          console.log("⏰ Lịch tập đã kết thúc, cập nhật...")
          fetchNextSchedule()
        }
      }
    }, 60000) // Kiểm tra mỗi phút

    return () => clearInterval(interval)
  }, [nextSchedule])

  const handleLogout = () => {
    Alert.alert("Xác nhận đăng xuất", "Bạn có chắc chắn muốn đăng xuất không?", [
      { text: "Hủy", style: "cancel" },
      {
        text: "Đăng xuất",
        style: "destructive",
        onPress: () => {
          navigation.navigate("Login")
        },
      },
    ])
  }

  if (!user) {
    return (
      <View style={styles.notLoggedIn}>
        <Ionicons name="person-circle-outline" size={80} color="#ccc" />
        <Text style={styles.notLoggedInText}>Bạn chưa đăng nhập</Text>
        <Text style={styles.notLoggedInSubtext}>Vui lòng đăng nhập để tiếp tục</Text>
      </View>
    )
  }

  const { avatar, email, role, notifications } = user

  const menuItems = [
    {
      title: "Đặt lịch tập",
      icon: "calendar",
      color: "#FF6B6B",
      onPress: () => navigation.navigate("Schedule"),
    },
    {
      title: "Thanh toán",
      icon: "card",
      color: "#4ECDC4",
      onPress: () => alert("Chức năng Thanh toán"),
    },
    {
      title: "Tiến độ",
      icon: "trending-up",
      color: "#45B7D1",
      onPress: () => alert("Chức năng Theo dõi tiến độ"),
    },
    {
      title: "Chat với PT",
      icon: "chatbubbles",
      color: "#96CEB4",
      onPress: () => navigation.navigate("chat", { friendName1 }),

    },

  ]

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor="#FF6B6B" />
      <ScrollView
        style={styles.container}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* Header với gradient */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <View style={styles.profileSection}>
              {avatar ? (
                <Image source={{ uri: avatar }} style={styles.avatar} />
              ) : (
                <View style={styles.avatarPlaceholder}>
                  <Text style={styles.avatarText}>{email[0].toUpperCase()}</Text>
                </View>
              )}
              <View style={styles.userInfo}>
                <Text style={styles.welcomeText}>Xin chào!</Text>
                <Text style={styles.userName}>{email}</Text>
                <View style={styles.roleBadge}>
                  <Text style={styles.roleText}>{role}</Text>
                </View>
              </View>
            </View>
            <TouchableOpacity style={styles.notificationButton} onPress={() => navigation.navigate('Notification_Manager')}>
              <Ionicons name="notifications" size={24} color="#fff" />
              {notifications && notifications.length > 0 && (
                <View style={styles.notificationBadge}>
                  <Text style={styles.notificationCount}>{notifications.length}</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.content}>
          {/* Thống kê sức khỏe */}
          <View style={styles.statsContainer}>
            <Text style={styles.sectionTitle}>Thông số sức khỏe</Text>
            {loading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="small" color="#FF6B6B" />
                <Text style={styles.loadingText}>Đang tải...</Text>
              </View>
            ) : (
              <View style={styles.statsRow}>
                <View style={styles.statCard}>
                  <Ionicons name="resize" size={24} color="#FF6B6B" />
                  <Text style={styles.statValue}>{healthInfo?.height ?? "--"}</Text>
                  <Text style={styles.statLabel}>Chiều cao (cm)</Text>
                </View>
                <View style={styles.statCard}>
                  <Ionicons name="fitness" size={24} color="#4ECDC4" />
                  <Text style={styles.statValue}>{healthInfo?.weight ?? "--"}</Text>
                  <Text style={styles.statLabel}>Cân nặng (kg)</Text>
                </View>
                <View style={styles.statCard}>
                  <Ionicons name="trophy" size={24} color="#FFD93D" />
                  <Text style={styles.statValue}>{healthInfo?.bmi ?? "--"}</Text>
                  <Text style={styles.statLabel}>BMI</Text>
                </View>
              </View>
            )}
          </View>

          {/* ✅ Lịch tập tiếp theo - Cập nhật với dữ liệu thực */}
          <View style={styles.scheduleCard}>
            <View style={styles.cardHeader}>
              <Ionicons name="calendar" size={24} color="#FF6B6B" />
              <Text style={styles.cardTitle}>Lịch tập tiếp theo</Text>
              {loadingSchedule && <ActivityIndicator size="small" color="#FF6B6B" style={{ marginLeft: 10 }} />}
            </View>

            {nextSchedule ? (
              <View style={styles.scheduleContent}>
                {/* Thời gian */}
                <View style={styles.scheduleItem}>
                  <Ionicons name="time" size={20} color="#666" />
                  <Text style={styles.scheduleText}>
                    {nextSchedule.date} • {nextSchedule.time} - {nextSchedule.endTime}
                  </Text>
                </View>

                {/* PT */}
                <View style={styles.scheduleItem}>
                  <Ionicons name="person" size={20} color="#666" />
                  <Text style={styles.scheduleText}>PT: {nextSchedule.trainerName}</Text>
                </View>

                {/* Gói tập */}
                {nextSchedule.packageName && (
                  <View style={styles.scheduleItem}>
                    <Ionicons name="fitness" size={20} color="#666" />
                    <Text style={styles.scheduleText}>Gói: {nextSchedule.packageName}</Text>
                  </View>
                )}

                {/* Ghi chú */}
                {nextSchedule.note && (
                  <View style={styles.scheduleItem}>
                    <Ionicons name="document-text" size={20} color="#666" />
                    <Text style={styles.scheduleText}>Ghi chú: {nextSchedule.note}</Text>
                  </View>
                )}

                {/* Status badge */}
                <View style={styles.scheduleStatus}>
                  <View style={styles.statusBadge}>
                    <Ionicons name="checkmark-circle" size={16} color="#27ae60" />
                    <Text style={styles.statusText}>Đã được duyệt</Text>
                  </View>
                </View>

                {/* Action buttons */}
                <View style={styles.scheduleActions}>
                  <TouchableOpacity style={styles.scheduleActionButton} onPress={() => navigation.navigate("Schedule")}>
                    <Ionicons name="calendar-outline" size={16} color="#FF6B6B" />
                    <Text style={styles.scheduleActionText}>Xem chi tiết</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <View style={styles.emptySchedule}>
                <Ionicons name="calendar-outline" size={40} color="#ccc" />
                <Text style={styles.emptyText}>Chưa có lịch tập nào được duyệt</Text>
                <TouchableOpacity style={styles.addScheduleButton} onPress={() => navigation.navigate("Schedule")}>
                  <Text style={styles.addScheduleText}>Đặt lịch ngay</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>

          {/* Menu chức năng */}
          <View style={styles.menuContainer}>
            <Text style={styles.sectionTitle}>Thao tác nhanh</Text>
            <View style={styles.menuGrid}>
              {menuItems.map((item, index) => (
                <TouchableOpacity
                  key={index}
                  style={[styles.menuItem, { backgroundColor: item.color }]}
                  onPress={item.onPress}
                  activeOpacity={0.8}
                >
                  <Ionicons name={item.icon} size={28} color="#fff" />
                  <Text style={styles.menuItemText}>{item.title}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Thông báo */}
          {notifications && notifications.length > 0 && (
            <View style={styles.notificationsCard}>
              <View style={styles.cardHeader}>
                <Ionicons name="notifications" size={24} color="#FF6B6B" />
                <Text style={styles.cardTitle}>Thông báo mới</Text>
              </View>
              {notifications.slice(0, 3).map((note, idx) => (
                <View key={idx} style={styles.notificationItem}>
                  <View style={styles.notificationDot} />
                  <Text style={styles.notificationText}>{note}</Text>
                </View>
              ))}
              {notifications.length > 3 && (
                <TouchableOpacity style={styles.viewAllButton}>
                  <Text style={styles.viewAllText}>Xem tất cả ({notifications.length})</Text>
                </TouchableOpacity>
              )}
            </View>
          )}

          {/* Nút đăng xuất */}
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Ionicons name="log-out-outline" size={20} color="#fff" />
            <Text style={styles.logoutButtonText}>Đăng xuất</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  header: {
    backgroundColor: "#FF6B6B",
    paddingTop: StatusBar.currentHeight || 40,
    paddingBottom: 30,
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
  },
  headerContent: {
    paddingHorizontal: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  profileSection: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 3,
    borderColor: "#fff",
  },
  avatarPlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "rgba(255,255,255,0.3)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: "#fff",
  },
  avatarText: {
    fontSize: 24,
    color: "#fff",
    fontWeight: "bold",
  },
  userInfo: {
    marginLeft: 15,
    flex: 1,
  },
  welcomeText: {
    fontSize: 16,
    color: "rgba(255,255,255,0.9)",
  },
  userName: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#fff",
    marginTop: 2,
  },
  roleBadge: {
    backgroundColor: "rgba(255,255,255,0.2)",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 5,
    alignSelf: "flex-start",
  },
  roleText: {
    fontSize: 12,
    color: "#fff",
    fontWeight: "600",
  },
  notificationButton: {
    position: "relative",
    padding: 8,
  },
  notificationBadge: {
    position: "absolute",
    top: 5,
    right: 5,
    backgroundColor: "#FFD93D",
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  notificationCount: {
    color: "#333",
    fontSize: 12,
    fontWeight: "bold",
  },
  content: {
    padding: 20,
    paddingTop: 30,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 15,
  },
  loadingContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  loadingText: {
    marginLeft: 10,
    color: "#666",
    fontSize: 14,
  },
  statsContainer: {
    marginBottom: 25,
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  statCard: {
    backgroundColor: "#fff",
    borderRadius: 15,
    padding: 20,
    alignItems: "center",
    width: (width - 60) / 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  statValue: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: "#666",
    textAlign: "center",
    marginTop: 4,
  },
  scheduleCard: {
    backgroundColor: "#fff",
    borderRadius: 15,
    padding: 20,
    marginBottom: 25,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginLeft: 10,
  },
  scheduleContent: {
    paddingLeft: 10,
  },
  scheduleItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  scheduleText: {
    fontSize: 15,
    color: "#333",
    marginLeft: 10,
    flex: 1,
  },
  scheduleStatus: {
    marginTop: 10,
    marginBottom: 15,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#e8f5e8",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    alignSelf: "flex-start",
  },
  statusText: {
    fontSize: 12,
    color: "#27ae60",
    marginLeft: 6,
    fontWeight: "600",
  },
  scheduleActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
  },
  scheduleActionButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8f9fa",
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#FF6B6B",
  },
  scheduleActionText: {
    fontSize: 12,
    color: "#FF6B6B",
    marginLeft: 6,
    fontWeight: "600",
  },
  emptySchedule: {
    alignItems: "center",
    paddingVertical: 20,
  },
  emptyText: {
    fontSize: 16,
    color: "#666",
    marginTop: 10,
    marginBottom: 15,
    textAlign: "center",
  },
  addScheduleButton: {
    backgroundColor: "#FF6B6B",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  addScheduleText: {
    color: "#fff",
    fontWeight: "600",
  },
  menuContainer: {
    marginBottom: 25,
  },
  menuGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  menuItem: {
    width: (width - 55) / 2,
    borderRadius: 15,
    padding: 20,
    alignItems: "center",
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  menuItemText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
    marginTop: 8,
    textAlign: "center",
  },
  notificationsCard: {
    backgroundColor: "#fff",
    borderRadius: 15,
    padding: 20,
    marginBottom: 25,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  notificationItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  notificationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#FF6B6B",
    marginRight: 12,
  },
  notificationText: {
    fontSize: 14,
    color: "#333",
    flex: 1,
  },
  viewAllButton: {
    alignItems: "center",
    paddingTop: 10,
  },
  viewAllText: {
    color: "#FF6B6B",
    fontWeight: "600",
  },
  logoutButton: {
    backgroundColor: "#e74c3c",
    borderRadius: 15,
    padding: 15,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  logoutButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    marginLeft: 8,
  },
  notLoggedIn: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
    backgroundColor: "#f8f9fa",
  },
  notLoggedInText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    marginTop: 20,
  },
  notLoggedInSubtext: {
    fontSize: 16,
    color: "#666",
    marginTop: 8,
    textAlign: "center",
  },
})

export default Home;