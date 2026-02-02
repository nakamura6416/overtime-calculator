import { useEffect, useState } from "react";
import { Box, Button, Input, Stack, Text, Divider, Flex } from "@chakra-ui/react";

/* ---------- 共通関数 ---------- */

const timeToMinutes = (time: string): number => {
    if (!time || !time.includes(":")) return 0;
    const [h, m] = time.split(":").map(Number);
    if (isNaN(h) || isNaN(m)) return 0;
    return h * 60 + m;
};

const minutesToTime = (minutes: number): string => {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return `${h}:${String(m).padStart(2, "0")}`;
};

const loadNumber = (key: string): number => {
    if (typeof window === "undefined") return 0;
    const saved = localStorage.getItem(key);
    return saved ? Number(saved) : 0;
};

/* ---------- App ---------- */

function App() {
    const INITIAL_TIME = "17:25";

    const [plannedEndTime, setPlannedEndTime] = useState(INITIAL_TIME);
    const [actualEndTime, setActualEndTime] = useState(INITIAL_TIME);

    const [weeklyOvertimeMinutes, setWeeklyOvertimeMinutes] = useState(() => loadNumber("weeklyOvertimeMinutes"));
    const [weeklyOvertimeInput, setWeeklyOvertimeInput] = useState(() => minutesToTime(loadNumber("weeklyOvertimeMinutes")));

    const [totalOvertimeMinutes, setTotalOvertimeMinutes] = useState(() => loadNumber("totalOvertimeMinutes"));
    const [totalInput, setTotalInput] = useState(() => minutesToTime(loadNumber("totalOvertimeMinutes")));

    const [grandTotalMinutes, setGrandTotalMinutes] = useState<number | null>(null);

    /* ---------- 計算 ---------- */

    const plannedMinutes = timeToMinutes(plannedEndTime);
    const actualMinutes = timeToMinutes(actualEndTime);

    const todayOvertime = actualMinutes > plannedMinutes ? actualMinutes - plannedMinutes : 0;

    const weeklyTotal = weeklyOvertimeMinutes + todayOvertime;

    /* ---------- localStorage ---------- */

    useEffect(() => {
        localStorage.setItem("weeklyOvertimeMinutes", weeklyOvertimeMinutes.toString());
    }, [weeklyOvertimeMinutes]);

    useEffect(() => {
        localStorage.setItem("totalOvertimeMinutes", totalOvertimeMinutes.toString());
    }, [totalOvertimeMinutes]);

    /* ---------- handlers ---------- */

    const handleWeeklyOvertimeChange = (value: string) => {
        setWeeklyOvertimeInput(value);
        setWeeklyOvertimeMinutes(timeToMinutes(value));
    };

    // 週途中の保存
    const handleSaveWeekly = () => {
        setWeeklyOvertimeMinutes(weeklyTotal);
        setWeeklyOvertimeInput(minutesToTime(weeklyTotal));
        setActualEndTime(INITIAL_TIME);
    };

    // ★ 合計（週締め）
    const handleTotal = () => {
        const sum = weeklyTotal + totalOvertimeMinutes;

        // 合計更新
        setGrandTotalMinutes(sum);
        setTotalOvertimeMinutes(sum);
        setTotalInput(minutesToTime(sum));

        // ★ 週のリセット
        setWeeklyOvertimeMinutes(0);
        setWeeklyOvertimeInput("0:00");
        setActualEndTime(INITIAL_TIME);
    };

    // 全初期化
    const handleResetAll = () => {
        setWeeklyOvertimeMinutes(0);
        setWeeklyOvertimeInput("0:00");

        setTotalOvertimeMinutes(0);
        setTotalInput("0:00");

        setGrandTotalMinutes(null);
        setActualEndTime(INITIAL_TIME);

        localStorage.clear();
    };

    /* ---------- UI ---------- */

    return (
        <Flex justify="center" p={6}>
            <Box maxW="360px" w="100%" p={6} borderWidth={1} borderRadius="lg">
                <Text fontSize="xl" fontWeight="bold" mb={6} textAlign="center">
                    残業時間計算ツール
                </Text>

                <Stack spacing={4}>
                    <Box>
                        <Text fontSize="sm">退勤予定時刻</Text>
                        <Input type="time" value={plannedEndTime} onChange={(e) => setPlannedEndTime(e.target.value)} />
                    </Box>

                    <Box>
                        <Text fontSize="sm">実際の退勤時刻</Text>
                        <Input type="time" value={actualEndTime} onChange={(e) => setActualEndTime(e.target.value)} />
                    </Box>

                    <Box>
                        <Text fontSize="sm">昨日までの残業時間</Text>
                        <Input type="text" placeholder="例: 12:30" value={weeklyOvertimeInput} onChange={(e) => handleWeeklyOvertimeChange(e.target.value)} />
                    </Box>

                    <Divider />

                    <Box textAlign="center">
                        <Text fontSize="sm">今日の残業時間</Text>
                        <Text fontSize="xl" fontWeight="bold">
                            {minutesToTime(todayOvertime)}
                        </Text>
                    </Box>

                    <Box textAlign="center">
                        <Text fontSize="sm">今週の残業時間</Text>
                        <Text fontSize="xl" fontWeight="bold">
                            {minutesToTime(weeklyTotal)}
                        </Text>
                    </Box>

                    <Button colorScheme="blue" onClick={handleSaveWeekly}>
                        保存
                    </Button>

                    <Divider />

                    <Box>
                        <Text fontSize="sm">先週までの残業時間</Text>
                        <Input
                            type="text"
                            placeholder="例: 120:00"
                            value={totalInput}
                            onChange={(e) => {
                                setTotalInput(e.target.value);
                                setTotalOvertimeMinutes(timeToMinutes(e.target.value));
                            }}
                        />
                    </Box>

                    <Button colorScheme="green" onClick={handleTotal}>
                        合算
                    </Button>

                    {grandTotalMinutes !== null && (
                        <Box textAlign="center">
                            <Text fontSize="sm">今月の残業時間</Text>
                            <Text fontSize="xl" fontWeight="bold">
                                {minutesToTime(grandTotalMinutes)}
                            </Text>
                        </Box>
                    )}

                    <Divider />

                    <Button colorScheme="red" onClick={handleResetAll}>
                        リセット
                    </Button>
                </Stack>
            </Box>
        </Flex>
    );
}

export default App;
