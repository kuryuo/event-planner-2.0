import MyCalendar from "@/components/calendar/Calendar.module.scss";
import SegmentedControl from "@/ui/segmented-control/SegmentedControl.tsx";
import {useState} from "react";
import Calendar from "@/components/calendar/Calendar.tsx";


function App() {

    // const subscriptions: CardBaseProps[] = [
    //     {
    //         title: 'Подписка 1',
    //         subtitle: 'Описание подписки 1',
    //         avatarUrl: 'https://randomuser.me/api/portraits/men/32.jpg',
    //     },
    //     {
    //         title: 'Подписка 2',
    //         subtitle: 'Описание подписки 2',
    //         avatarUrl: 'https://randomuser.me/api/portraits/women/44.jpg',
    //     },
    //     {
    //         title: 'Подписка 3',
    //         subtitle: 'Описание подписки 3',
    //         avatarUrl: 'https://randomuser.me/api/portraits/men/56.jpg',
    //     },
    // ];
    const [selectedOption, setSelectedOption] = useState("Option 1");

    const handleChange = (value: string) => {
        setSelectedOption(value);
    };

    return (
        <div
            style={{
                // display: 'flex',
                // flexDirection: 'column',
                // justifyContent: 'center',
                // alignItems: 'center',
            }}>
            {/*<SegmentedControl*/}
            {/*    options={["Option 1", "Option 2", "Option 3"]}*/}
            {/*    selected={selectedOption}*/}
            {/*    onChange={handleChange}*/}
            {/*/>*/}
            <Calendar/>

        </div>
        // <Router>
        //     <Routes>
        //         <Route
        //             path="/s"
        //             element={
        //                 <Button >
        //                     Button
        //                 </Button>
        //             }
        //         />
        //         <Route path="/d" element={<TextField label='пример' helperText = 'ddd' error={true}/>}/>
        //         <Route path="/as" element={<TextArea label='Поле' helperText = 'ddd' />}/>
        //         <Route path="/" element={<Select label='Поле' helperText = 'ddd' />}/>
        //     </Routes>
        // </Router>
    );
}

export default App;
