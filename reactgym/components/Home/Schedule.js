import { useState, useEffect, useContext } from "react"
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
  ScrollView,
  Platform,
  StyleSheet,
  Dimensions,
  StatusBar,
} from "react-native"
import { Ionicons } from "@expo/vector-icons"
import DateTimePicker from "@react-native-community/datetimepicker"
import { authApis, endpoints } from "../../configs/Apis"
import { MyUserContext } from "../../configs/MyContexts"

const { width } = Dimensions.get("window")

const Schedule = ({ navigation }) => {
  const user = useContext(MyUserContext)
  const [startTime, setStartTime] = useState(new Date())
  const [endTime, setEndTime] = useState(new Date())
  const [note, setNote] = useState("")
  const [memberPackages, setMemberPackages] = useState([])
  const [selectedPackage, setSelectedPackage] = useState(null)
  const [personalTrainers, setPersonalTrainers] = useState([])
  const [selectedPT, setSelectedPT] = useState(null)
  const [loading, setLoading] = useState(false)

  // Separate pickers for date and time
  const [showStartDatePicker, setShowStartDatePicker] = useState(false)
  const [showStartTimePicker, setShowStartTimePicker] = useState(false)
  const [showEndDatePicker, setShowEndDatePicker] = useState(false)
  const [showEndTimePicker, setShowEndTimePicker] = useState(false)

  const [showPackagePicker, setShowPackagePicker] = useState(false)
  const [showPTPicker, setShowPTPicker] = useState(false)

  const fetchMemberPackages = async () => {
    if (!user || !user.access_token) {
      Alert.alert("Lỗi", "Vui lòng đăng nhập lại")
      return
    }

    try {
      setLoading(true)
      const api = authApis(user.access_token)
      const res = await api.get(endpoints["member-packages"])

      const packages = res.data?.results || res.data || []
      setMemberPackages(packages)

      if (packages.length > 0) {
        setSelectedPackage(packages[0].id)
      }
    } catch (err) {
      console.error(" Error fetching packages:", err)
      setMemberPackages([])
      Alert.alert("Lỗi", "Không lấy được gói tập!")
    } finally {
      setLoading(false)
    }
  }

  const fetchPersonalTrainers = async () => {
    if (!user || !user.access_token) return

    try {
      const api = authApis(user.access_token)
      const res = await api.get(endpoints["personal-trainers"])

      const trainers = res.data || []
      setPersonalTrainers(trainers)
    } catch (err) {
      console.error("❌ Error fetching PTs:", err)
      setPersonalTrainers([])
    }
  }

  useEffect(() => {
    if (user && user.access_token) {
      fetchMemberPackages()
      fetchPersonalTrainers()
    }
  }, [user])

  // Date picker handlers
  const onStartDateChange = (event, selectedDate) => {
    setShowStartDatePicker(false)
    if (event.type === "set" && selectedDate) {
      const newStartTime = new Date(startTime)
      newStartTime.setFullYear(selectedDate.getFullYear())
      newStartTime.setMonth(selectedDate.getMonth())
      newStartTime.setDate(selectedDate.getDate())
      setStartTime(newStartTime)
    }
  }

  const onStartTimeChange = (event, selectedTime) => {
    setShowStartTimePicker(false)
    if (event.type === "set" && selectedTime) {
      const newStartTime = new Date(startTime)
      newStartTime.setHours(selectedTime.getHours())
      newStartTime.setMinutes(selectedTime.getMinutes())
      setStartTime(newStartTime)
    }
  }

  const onEndDateChange = (event, selectedDate) => {
    setShowEndDatePicker(false)
    if (event.type === "set" && selectedDate) {
      const newEndTime = new Date(endTime)
      newEndTime.setFullYear(selectedDate.getFullYear())
      newEndTime.setMonth(selectedDate.getMonth())
      newEndTime.setDate(selectedDate.getDate())
      setEndTime(newEndTime)
    }
  }

  const onEndTimeChange = (event, selectedTime) => {
    setShowEndTimePicker(false)
    if (event.type === "set" && selectedTime) {
      const newEndTime = new Date(endTime)
      newEndTime.setHours(selectedTime.getHours())
      newEndTime.setMinutes(selectedTime.getMinutes())
      setEndTime(newEndTime)
    }
  }

  const handleBooking = async () => {
    if (!selectedPackage) {
      Alert.alert("Thông báo", "Bạn chưa chọn gói tập!")
      return
    }

    if (endTime <= startTime) {
      Alert.alert("Lỗi", "Thời gian kết thúc phải sau thời gian bắt đầu!")
      return
    }

    // Kiểm tra số buổi còn lại nếu chọn PT
    if (selectedPT) {
      const selectedPkg = memberPackages.find((pkg) => pkg.id === selectedPackage)
      if (selectedPkg && selectedPkg.remaining_sessions <= 0) {
        Alert.alert("Lỗi", "Gói tập của bạn đã hết số buổi tập với PT!")
        return
      }
    }

    try {
      setLoading(true)
      const api = authApis(user.access_token)
      const payload = {
        start_time: startTime.toISOString(),
        end_time: endTime.toISOString(),
        note: note,
        member_package_id: selectedPackage,
        user_id: user.id, //  Thêm user_id
      }

      // Chỉ thêm pt_id nếu có chọn PT
      if (selectedPT) {
        payload.pt_id = selectedPT
      }

      console.log("🔍 Complete payload:", payload)

      const response = await api.post(endpoints["schedules"], payload)

      console.log(" Success:", response.data)

      const successMessage = selectedPT ? "Bạn đã đặt lịch tập với PT thành công!" : "Bạn đã đặt lịch tập thành công!"

      Alert.alert("Thành công", successMessage, [
        {
          text: "Về trang chủ",
          onPress: () => navigation.navigate("home"),
        },
        {
          text: "Đặt lịch khác",
          onPress: () => {
            setNote("")
            setStartTime(new Date())
            setEndTime(new Date())
            setSelectedPT(null)
          },
        },
      ])
    } catch (err) {
      console.error(" Booking error:", err)
      console.error(" Error response:", err.response?.data)
      console.error(" Error status:", err.response?.status)

      Alert.alert("Lỗi", `Đặt lịch thất bại! Status: ${err.response?.status}`)
    } finally {
      setLoading(false)
    }
  }

  const handleGoBack = () => {
    if (navigation.canGoBack()) {
      navigation.goBack()
    } else {
      navigation.navigate("home")
    }
  }

  const formatDate = (date) => {
    return date.toLocaleDateString("vi-VN", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  const formatTime = (date) => {
    return date.toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const formatDateTime = (date) => {
    return date.toLocaleString("vi-VN", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const getSelectedPackageName = () => {
    const pkg = memberPackages.find((p) => p.id === selectedPackage)
    return pkg?.package?.name || "Chọn gói tập"
  }

  const getSelectedPTName = () => {
    if (!selectedPT) return "Không chọn PT (tự tập)"
    const pt = personalTrainers.find((trainer) => trainer.id === selectedPT)
    return pt ? `${pt.first_name} ${pt.last_name}` : "PT không xác định"
  }

  const getSelectedPackageInfo = () => {
    const pkg = memberPackages.find((p) => p.id === selectedPackage)
    return pkg
  }

  const handlePTSelection = (ptId) => {
    setSelectedPT(ptId)
    setShowPTPicker(false)
  }

  // Quick time selection helpers
  const setQuickTime = (type, hours, minutes = 0) => {
    const now = new Date()
    const newTime = new Date(now)
    newTime.setHours(hours, minutes, 0, 0)

    if (type === "start") {
      setStartTime(newTime)
    } else {
      setEndTime(newTime)
    }
  }

  if (!user) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF6B6B" />
        <Text style={styles.loadingText}>Đang tải thông tin người dùng...</Text>
      </View>
    )
  }

  const selectedPackageInfo = getSelectedPackageInfo()

  return (
    <>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Header với nút Back */}
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <TouchableOpacity style={styles.backButton} onPress={handleGoBack}>
              <Ionicons name="chevron-back" size={24} color="#333" />
              <Text style={styles.backButtonText}>Trang chủ</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.helpButton}>
              <Ionicons name="help-circle-outline" size={24} color="#666" />
            </TouchableOpacity>
          </View>

          <View style={styles.headerContent}>
            <Ionicons name="calendar" size={28} color="#FF6B6B" />
            <Text style={styles.headerTitle}>Đặt lịch tập</Text>
          </View>
          <Text style={styles.headerSubtitle}>Chọn thời gian, gói tập và PT phù hợp</Text>
        </View>

        <View style={styles.content}>
          {/* Package Selection Card */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Ionicons name="fitness" size={20} color="#FF6B6B" />
              <Text style={styles.cardTitle}>Gói tập</Text>
            </View>

            {memberPackages && memberPackages.length > 0 ? (
              <>
                <TouchableOpacity style={styles.selectButton} onPress={() => setShowPackagePicker(!showPackagePicker)}>
                  <Text style={styles.selectButtonText}>{getSelectedPackageName()}</Text>
                  <Ionicons name={showPackagePicker ? "chevron-up" : "chevron-down"} size={20} color="#666" />
                </TouchableOpacity>

                {selectedPackageInfo && (
                  <View style={styles.packageInfo}>
                    <View style={styles.packageInfoRow}>
                      <Ionicons name="time-outline" size={16} color="#666" />
                      <Text style={styles.packageInfoText}>
                        Số lượng: {selectedPackageInfo.remaining_sessions} buổi PT
                      </Text>
                    </View>
                    <View style={styles.packageInfoRow}>
                      <Ionicons name="calendar-outline" size={16} color="#666" />
                      <Text style={styles.packageInfoText}>
                        Hạn: {new Date(selectedPackageInfo.end_date).toLocaleDateString("vi-VN")}
                      </Text>
                    </View>
                  </View>
                )}

                {showPackagePicker && (
                  <View style={styles.optionsContainer}>
                    {memberPackages.map((pkg) => (
                      <TouchableOpacity
                        key={pkg.id}
                        style={[styles.optionItem, selectedPackage === pkg.id && styles.optionItemSelected]}
                        onPress={() => {
                          setSelectedPackage(pkg.id)
                          setShowPackagePicker(false)
                        }}
                      >
                        <Text style={[styles.optionText, selectedPackage === pkg.id && styles.optionTextSelected]}>
                          {pkg.package?.name || `Gói ${pkg.id}`}
                        </Text>
                        {selectedPackage === pkg.id && <Ionicons name="checkmark" size={20} color="#FF6B6B" />}
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </>
            ) : (
              <View style={styles.emptyState}>
                <Ionicons name="alert-circle-outline" size={40} color="#ccc" />
                <Text style={styles.emptyText}>Không có gói tập nào</Text>
                <TouchableOpacity style={styles.retryButton} onPress={fetchMemberPackages}>
                  <Text style={styles.retryButtonText}>Tải lại</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>

          {/* PT Selection Card */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Ionicons name="person" size={20} color="#96CEB4" />
              <Text style={styles.cardTitle}>Personal Trainer</Text>
              <View style={styles.optionalBadge}>
                <Text style={styles.optionalText}>Tùy chọn</Text>
              </View>
            </View>

            {/* PT Status */}
            <View style={styles.ptStatusContainer}>
              <Ionicons
                name={personalTrainers.length > 0 ? "checkmark-circle" : "alert-circle"}
                size={16}
                color={personalTrainers.length > 0 ? "#27ae60" : "#e74c3c"}
              />
              <Text
                style={[
                  styles.ptStatusText,
                  {
                    color: personalTrainers.length > 0 ? "#27ae60" : "#e74c3c",
                  },
                ]}
              >
                {personalTrainers.length > 0 ? `${personalTrainers.length} PT có sẵn` : "Không có PT nào"}
              </Text>
            </View>

            {/* PT Select Button */}
            <TouchableOpacity style={styles.selectButton} onPress={() => setShowPTPicker(!showPTPicker)}>
              <Text style={styles.selectButtonText}>{getSelectedPTName()}</Text>
              <Ionicons name={showPTPicker ? "chevron-up" : "chevron-down"} size={20} color="#666" />
            </TouchableOpacity>

            {/* PT Warning */}
            {selectedPT && selectedPackageInfo && selectedPackageInfo.remaining_sessions <= 0 && (
              <View style={styles.warningContainer}>
                <Ionicons name="warning" size={16} color="#e74c3c" />
                <Text style={styles.warningText}>Gói tập đã hết buổi PT. Bạn sẽ không thể đặt lịch với PT.</Text>
              </View>
            )}

            {/* Custom PT Options Dropdown */}
            {showPTPicker && (
              <View style={styles.optionsContainer}>
                {/* No PT Option */}
                <TouchableOpacity
                  style={[styles.optionItem, selectedPT === null && styles.optionItemSelected]}
                  onPress={() => handlePTSelection(null)}
                >
                  <Text style={[styles.optionText, selectedPT === null && styles.optionTextSelected]}>
                    Không chọn PT (tự tập)
                  </Text>
                  {selectedPT === null && <Ionicons name="checkmark" size={20} color="#96CEB4" />}
                </TouchableOpacity>

                {/* PT Options */}
                {personalTrainers.map((trainer) => (
                  <TouchableOpacity
                    key={trainer.id}
                    style={[styles.optionItem, selectedPT === trainer.id && styles.optionItemSelected]}
                    onPress={() => handlePTSelection(trainer.id)}
                  >
                    <View style={styles.ptOptionContent}>
                      <Text style={[styles.optionText, selectedPT === trainer.id && styles.optionTextSelected]}>
                        {trainer.last_name} {trainer.first_name}
                      </Text>
                      <Text style={styles.ptOptionEmail}>{trainer.email}</Text>
                      {trainer.specialization && (
                        <Text style={styles.ptOptionSpecialization}>🎯 {trainer.specialization}</Text>
                      )}
                    </View>
                    {selectedPT === trainer.id && <Ionicons name="checkmark" size={20} color="#96CEB4" />}
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {/* PT Info */}
            {selectedPT && (
              <View style={styles.ptInfo}>
                <Text style={styles.ptInfoTitle}>Thông tin PT đã chọn:</Text>
                {(() => {
                  const pt = personalTrainers.find((t) => t.id === selectedPT)
                  return pt ? (
                    <View>
                      <Text style={styles.ptInfoText}>
                        👤 {pt.last_name} {pt.first_name}
                      </Text>
                      <Text style={styles.ptInfoText}>📧 {pt.email}</Text>
                      {pt.phone && <Text style={styles.ptInfoText}>📞 {pt.phone}</Text>}
                      {pt.specialization && <Text style={styles.ptInfoText}>🎯 {pt.specialization}</Text>}
                    </View>
                  ) : null
                })()}
              </View>
            )}

            {/* Retry button for PT */}
            {personalTrainers.length === 0 && (
              <View style={styles.emptyState}>
                <Ionicons name="person-outline" size={40} color="#ccc" />
                <Text style={styles.emptyText}>Không có PT nào</Text>
                <TouchableOpacity style={styles.retryButton} onPress={fetchPersonalTrainers}>
                  <Text style={styles.retryButtonText}>Tải lại</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>

          {/* Enhanced Time Selection Card */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Ionicons name="time" size={20} color="#4ECDC4" />
              <Text style={styles.cardTitle}>Thời gian</Text>
            </View>

            {/* Start Time */}
            <View style={styles.timeSection}>
              <Text style={styles.timeLabel}>Thời gian bắt đầu</Text>

              {/* Date Selection */}
              <TouchableOpacity style={styles.timeButton} onPress={() => setShowStartDatePicker(true)}>
                <Ionicons name="calendar-outline" size={20} color="#4ECDC4" />
                <View style={styles.timeButtonContent}>
                  <Text style={styles.timeButtonLabel}>Ngày:</Text>
                  <Text style={styles.timeButtonText}>{formatDate(startTime)}</Text>
                </View>
                <Ionicons name="chevron-forward" size={16} color="#666" />
              </TouchableOpacity>

              {/* Time Selection */}
              <TouchableOpacity style={styles.timeButton} onPress={() => setShowStartTimePicker(true)}>
                <Ionicons name="time-outline" size={20} color="#4ECDC4" />
                <View style={styles.timeButtonContent}>
                  <Text style={styles.timeButtonLabel}>Giờ:</Text>
                  <Text style={styles.timeButtonText}>{formatTime(startTime)}</Text>
                </View>
                <Ionicons name="chevron-forward" size={16} color="#666" />
              </TouchableOpacity>

              {/* Quick Time Selection for Start */}
              <View style={styles.quickTimeContainer}>
                <Text style={styles.quickTimeLabel}>Giờ phổ biến:</Text>
                <View style={styles.quickTimeButtons}>
                  {[6, 7, 8, 9, 17, 18, 19, 20].map((hour) => (
                    <TouchableOpacity
                      key={hour}
                      style={[styles.quickTimeButton, startTime.getHours() === hour && styles.quickTimeButtonSelected]}
                      onPress={() => setQuickTime("start", hour)}
                    >
                      <Text
                        style={[
                          styles.quickTimeButtonText,
                          startTime.getHours() === hour && styles.quickTimeButtonTextSelected,
                        ]}
                      >
                        {hour}:00
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </View>

            {/* End Time */}
            <View style={styles.timeSection}>
              <Text style={styles.timeLabel}>Thời gian kết thúc</Text>

              {/* Date Selection */}
              <TouchableOpacity style={styles.timeButton} onPress={() => setShowEndDatePicker(true)}>
                <Ionicons name="calendar-outline" size={20} color="#4ECDC4" />
                <View style={styles.timeButtonContent}>
                  <Text style={styles.timeButtonLabel}>Ngày:</Text>
                  <Text style={styles.timeButtonText}>{formatDate(endTime)}</Text>
                </View>
                <Ionicons name="chevron-forward" size={16} color="#666" />
              </TouchableOpacity>

              {/* Time Selection */}
              <TouchableOpacity style={styles.timeButton} onPress={() => setShowEndTimePicker(true)}>
                <Ionicons name="time-outline" size={20} color="#4ECDC4" />
                <View style={styles.timeButtonContent}>
                  <Text style={styles.timeButtonLabel}>Giờ:</Text>
                  <Text style={styles.timeButtonText}>{formatTime(endTime)}</Text>
                </View>
                <Ionicons name="chevron-forward" size={16} color="#666" />
              </TouchableOpacity>



            </View>

            {/* Duration Display */}
            <View style={styles.durationContainer}>
              <Ionicons name="hourglass-outline" size={16} color="#666" />
              <Text style={styles.durationText}>
                Thời lượng: {Math.round((endTime - startTime) / (1000 * 60))} phút
              </Text>
            </View>

            {/* Full DateTime Display */}
            <View style={styles.fullTimeDisplay}>
              <Text style={styles.fullTimeText}>
                📅 {formatDateTime(startTime)} → {formatDateTime(endTime)}
              </Text>
            </View>
          </View>

          {/* Notes Card */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Ionicons name="document-text" size={20} color="#45B7D1" />
              <Text style={styles.cardTitle}>Ghi chú</Text>
            </View>

            <TextInput
              value={note}
              onChangeText={setNote}
              placeholder="Ví dụ: cần PT nữ, tập giảm cân, tập nhóm..."
              placeholderTextColor="#999"
              multiline
              numberOfLines={3}
              style={styles.noteInput}
            />

            <View style={styles.noteHints}>
              <Text style={styles.noteHintTitle}>Gợi ý:</Text>
              <View style={styles.hintChipsContainer}>
                {["Cần PT nam/nữ", "Tập giảm cân", "Tập tăng cơ", "Tập nhóm", "Tập cardio"].map((hint, index) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.hintChip}
                    onPress={() => setNote(note ? `${note}, ${hint}` : hint)}
                  >
                    <Text style={styles.hintChipText}>{hint}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>

          {/* Summary Card */}
          <View style={styles.summaryCard}>
            <Text style={styles.summaryTitle}>Tóm tắt đặt lịch</Text>
            <View style={styles.summaryRow}>
              <Ionicons name="fitness" size={16} color="#666" />
              <Text style={styles.summaryText}>Gói: {getSelectedPackageName()}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Ionicons name="person" size={16} color="#666" />
              <Text style={styles.summaryText}>PT: {getSelectedPTName()}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Ionicons name="time" size={16} color="#666" />
              <Text style={styles.summaryText}>
                {formatDateTime(startTime)} - {formatDateTime(endTime)}
              </Text>
            </View>
            {note ? (
              <View style={styles.summaryRow}>
                <Ionicons name="document-text" size={16} color="#666" />
                <Text style={styles.summaryText}>Ghi chú: {note}</Text>
              </View>
            ) : null}
            {selectedPT && selectedPackageInfo && (
              <View style={styles.summaryRow}>
                <Ionicons name="information-circle" size={16} color="#666" />
                <Text style={styles.summaryText}>
                  Sau khi đặt lịch: {selectedPackageInfo.remaining_sessions - 1} buổi PT còn lại
                </Text>
              </View>
            )}
          </View>

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            <TouchableOpacity style={styles.cancelButton} onPress={handleGoBack}>
              <Ionicons name="close-circle-outline" size={20} color="#666" />
              <Text style={styles.cancelButtonText}>Hủy</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.bookButton,
                (!selectedPackage || loading || (selectedPT && selectedPackageInfo?.remaining_sessions <= 0)) &&
                styles.bookButtonDisabled,
              ]}
              onPress={handleBooking}
              disabled={!selectedPackage || loading || (selectedPT && selectedPackageInfo?.remaining_sessions <= 0)}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Ionicons name="checkmark-circle" size={20} color="#fff" />
              )}
              <Text style={styles.bookButtonText}>{loading ? "Đang đặt..." : "Xác nhận"}</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Date Time Pickers */}
        {showStartDatePicker && (
          <DateTimePicker
            value={startTime}
            mode="date"
            display={Platform.OS === "ios" ? "spinner" : "default"}
            onChange={onStartDateChange}
          />
        )}

        {showStartTimePicker && (
          <DateTimePicker
            value={startTime}
            mode="time"
            display={Platform.OS === "ios" ? "spinner" : "default"}
            onChange={onStartTimeChange}
          />
        )}

        {showEndDatePicker && (
          <DateTimePicker
            value={endTime}
            mode="date"
            display={Platform.OS === "ios" ? "spinner" : "default"}
            onChange={onEndDateChange}
          />
        )}

        {showEndTimePicker && (
          <DateTimePicker
            value={endTime}
            mode="time"
            display={Platform.OS === "ios" ? "spinner" : "default"}
            onChange={onEndTimeChange}
          />
        )}
      </ScrollView>
    </>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f8f9fa",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#666",
  },
  header: {
    backgroundColor: "#fff",
    paddingTop: StatusBar.currentHeight || 40,
    paddingBottom: 30,
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
  helpButton: {
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
  content: {
    padding: 20,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
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
    fontWeight: "600",
    color: "#333",
    marginLeft: 10,
    flex: 1,
  },
  optionalBadge: {
    backgroundColor: "#e8f5e8",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  optionalText: {
    fontSize: 10,
    color: "#27ae60",
    fontWeight: "600",
  },
  selectButton: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    padding: 15,
    backgroundColor: "#f9f9f9",
  },
  selectButtonText: {
    fontSize: 16,
    color: "#333",
    flex: 1,
  },
  optionsContainer: {
    marginTop: 10,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    backgroundColor: "#fff",
    maxHeight: 200,
  },
  optionItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  optionItemSelected: {
    backgroundColor: "#f0f8ff",
  },
  optionText: {
    fontSize: 16,
    color: "#333",
    flex: 1,
  },
  optionTextSelected: {
    color: "#FF6B6B",
    fontWeight: "600",
  },
  ptOptionContent: {
    flex: 1,
  },
  ptOptionEmail: {
    fontSize: 12,
    color: "#666",
    marginTop: 2,
  },
  ptOptionSpecialization: {
    fontSize: 11,
    color: "#96CEB4",
    marginTop: 2,
  },
  packageInfo: {
    marginTop: 10,
    padding: 10,
    backgroundColor: "#f0f8ff",
    borderRadius: 8,
  },
  packageInfoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 5,
  },
  packageInfoText: {
    fontSize: 14,
    color: "#666",
    marginLeft: 8,
  },
  ptInfo: {
    marginTop: 10,
    padding: 10,
    backgroundColor: "#f0f8f0",
    borderRadius: 8,
  },
  ptInfoTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginBottom: 5,
  },
  ptInfoText: {
    fontSize: 12,
    color: "#666",
    marginBottom: 2,
  },
  warningContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
    padding: 10,
    backgroundColor: "#fff5f5",
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: "#e74c3c",
  },
  warningText: {
    fontSize: 12,
    color: "#e74c3c",
    marginLeft: 8,
    flex: 1,
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 30,
  },
  emptyText: {
    fontSize: 16,
    color: "#666",
    marginTop: 10,
    marginBottom: 15,
  },
  retryButton: {
    backgroundColor: "#FF6B6B",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  retryButtonText: {
    color: "#fff",
    fontWeight: "600",
  },
  timeSection: {
    marginBottom: 20,
  },
  timeLabel: {
    fontSize: 16,
    color: "#333",
    marginBottom: 12,
    fontWeight: "600",
  },
  timeButton: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    padding: 15,
    backgroundColor: "#f9f9f9",
    marginBottom: 8,
  },
  timeButtonContent: {
    flex: 1,
    marginLeft: 10,
  },
  timeButtonLabel: {
    fontSize: 12,
    color: "#666",
    marginBottom: 2,
  },
  timeButtonText: {
    fontSize: 16,
    color: "#333",
    fontWeight: "500",
  },
  quickTimeContainer: {
    marginTop: 10,
  },
  quickTimeLabel: {
    fontSize: 12,
    color: "#666",
    marginBottom: 8,
  },
  quickTimeButtons: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  quickTimeButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    backgroundColor: "#f0f0f0",
    borderWidth: 1,
    borderColor: "#ddd",
  },
  quickTimeButtonSelected: {
    backgroundColor: "#4ECDC4",
    borderColor: "#4ECDC4",
  },
  quickTimeButtonText: {
    fontSize: 12,
    color: "#666",
    fontWeight: "500",
  },
  quickTimeButtonTextSelected: {
    color: "#fff",
    fontWeight: "600",
  },
  durationContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#e8f5e8",
    padding: 12,
    borderRadius: 8,
    marginTop: 15,
  },
  durationText: {
    fontSize: 14,
    color: "#27ae60",
    marginLeft: 8,
    fontWeight: "500",
  },
  fullTimeDisplay: {
    backgroundColor: "#f0f8ff",
    padding: 12,
    borderRadius: 8,
    marginTop: 10,
    alignItems: "center",
  },
  fullTimeText: {
    fontSize: 14,
    color: "#4ECDC4",
    fontWeight: "500",
  },
  noteInput: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    padding: 15,
    fontSize: 16,
    backgroundColor: "#f9f9f9",
    textAlignVertical: "top",
    minHeight: 80,
  },
  noteHints: {
    marginTop: 15,
  },
  noteHintTitle: {
    fontSize: 14,
    color: "#666",
    marginBottom: 10,
    fontWeight: "500",
  },
  hintChipsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  hintChip: {
    backgroundColor: "#e3f2fd",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    marginRight: 8,
    marginBottom: 8,
  },
  hintChipText: {
    fontSize: 12,
    color: "#1976d2",
    fontWeight: "500",
  },
  summaryCard: {
    backgroundColor: "#fff",
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: "#FF6B6B",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginBottom: 15,
  },
  summaryRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  summaryText: {
    fontSize: 14,
    color: "#666",
    marginLeft: 10,
    flex: 1,
    lineHeight: 20,
  },
  actionButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  cancelButton: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
    borderRadius: 15,
    padding: 18,
    marginRight: 10,
  },
  cancelButtonText: {
    color: "#666",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
  bookButton: {
    flex: 2,
    backgroundColor: "#FF6B6B",
    borderRadius: 15,
    padding: 18,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#FF6B6B",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  bookButtonDisabled: {
    backgroundColor: "#ccc",
    shadowColor: "#ccc",
  },
  bookButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    marginLeft: 8,
  },
  ptStatusContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
    paddingHorizontal: 5,
  },
  ptStatusText: {
    fontSize: 12,
    marginLeft: 6,
    fontWeight: "500",
  },
})

export default Schedule