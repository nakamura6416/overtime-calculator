import { useEffect, useState } from "react";
import { Box, Button, Input, Stack, Text, Divider } from "@chakra-ui/react";

/* ---------- 共通関数 ---------- */

const timeToMinutes = (time: string): number => {
    if (!time) return 0;
    const [h, m] = time.split(":").map(Number);
    return h * 60 + m;
};

const minutesToTime = (minutes: number): string => {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return `${h}:${String(m).padStart(2, "0")}`;
};

const formatMinutes = (minutes: number): string => {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return `${h}:${String(m).padStart(2, "0")}`;
};

const loadWeeklyOvertime = (): number => {
    if (typeof window === "undefined") return 0;
    const saved = localStorage.getItem("weeklyOvertimeMinutes");
    return saved ? Number(saved) : 0;
};

const formatTodayOvertime = (minutes: number): string => {
    if (minutes === 0) return "0:00";
    return formatMinutes(minutes);
};

function App() {
    const [plannedEndTime, setPlannedEndTime] = useState("17:25");
    const [actualEndTime, setActualEndTime] = useState("17:25");

    const [weeklyOvertimeMinutes, setWeeklyOvertimeMinutes] = useState<number>(() => loadWeeklyOvertime());

    const [weeklyOvertimeInput, setWeeklyOvertimeInput] = useState<string>(() => minutesToTime(loadWeeklyOvertime()));

    useEffect(() => {
        localStorage.setItem("weeklyOvertimeMinutes", weeklyOvertimeMinutes.toString());
    }, [weeklyOvertimeMinutes]);

    const plannedMinutes = timeToMinutes(plannedEndTime);
    const actualMinutes = timeToMinutes(actualEndTime);

    const todayOvertime = actualMinutes > plannedMinutes ? actualMinutes - plannedMinutes : 0;

    const weeklyTotal = weeklyOvertimeMinutes + todayOvertime;

    const handleWeeklyOvertimeChange = (value: string) => {
        setWeeklyOvertimeInput(value);
        setWeeklyOvertimeMinutes(timeToMinutes(value));
    };

    const resetWeeklyOvertime = () => {
        setWeeklyOvertimeMinutes(0);
        setWeeklyOvertimeInput("00:00");
        localStorage.removeItem("weeklyOvertimeMinutes");
    };

    return (
        <Box p={6}>
            <Box maxW="420px" mx="auto" w="100%" p={6} borderWidth={1} borderRadius="lg">
                <Text size="md" fontSize="xl" fontWeight="bold" mb={8}>
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
                        <Text fontSize="sm">すでにある週の残業時間（hh:mm）</Text>
                        <Input type="time" value={weeklyOvertimeInput} onChange={(e) => handleWeeklyOvertimeChange(e.target.value)} />
                    </Box>

                    <Divider my={4} />

                    <Box>
                        <Text fontSize="sm">今日の残業時間</Text>
                        <Text textAlign="center" fontSize="xl" fontWeight="bold">
                            {formatTodayOvertime(todayOvertime)}
                        </Text>
                    </Box>

                    <Divider />

                    <Text>
                        <Text fontSize="sm">週の残業時間（累計）</Text>
                        <Text textAlign="center" fontSize="xl" fontWeight="bold">
                            {formatMinutes(weeklyTotal)}
                        </Text>
                    </Text>

                    <Button colorScheme="red" onClick={resetWeeklyOvertime} mt={4}>
                        週の残業をリセット
                    </Button>
                </Stack>
            </Box>
        </Box>
    );
}

export default App;
