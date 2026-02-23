import { useRef, useState, useEffect } from 'react';
import {
  FiBold,
  FiItalic,
  FiUnderline,
  FiList,
  FiAlignLeft,
  FiAlignCenter,
  FiAlignRight,
  FiLink,
  FiCode,
  FiMinus,
  FiType,
} from 'react-icons/fi';
import { BsTypeStrikethrough, BsChatSquareQuote } from 'react-icons/bs';
import { IoListOutline } from 'react-icons/io5';
import './RichTextEditor.css';

export function RichTextEditor({ value = '', onChange, placeholder = 'Введите текст...', disabled = false }) {
  const editorRef = useRef(null);
  const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const isInternalChange = useRef(false);

  // Обновляем innerHTML только когда меняется внешнее value
  useEffect(() => {
    if (!isInternalChange.current && editorRef.current && value !== editorRef.current.innerHTML) {
      editorRef.current.innerHTML = value;
    }
    isInternalChange.current = false;
  }, [value]);

  // Инициализация при монтировании
  useEffect(() => {
    if (editorRef.current) {
      if (value) {
        editorRef.current.innerHTML = value;
      }
      // Добавляем placeholder через data-атрибут
      editorRef.current.setAttribute('data-placeholder', placeholder);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const execCommand = (command, value = null) => {
    document.execCommand(command, false, value);
    editorRef.current?.focus();
    if (onChange) {
      onChange(editorRef.current?.innerHTML || '');
    }
  };

  const handleInput = () => {
    isInternalChange.current = true;
    if (onChange) {
      onChange(editorRef.current?.innerHTML || '');
    }
  };

  const handleLink = () => {
    const selection = window.getSelection();
    const selectedText = selection.toString();
    
    if (selectedText) {
      setLinkUrl('');
      setIsLinkModalOpen(true);
    } else {
      alert('Выделите текст для добавления ссылки');
    }
  };

  const insertLink = () => {
    if (linkUrl) {
      execCommand('createLink', linkUrl);
    }
    setIsLinkModalOpen(false);
    setLinkUrl('');
  };

  const ToolbarButton = ({ command, value, icon: Icon, title, active = false }) => (
    <button
      type="button"
      className={`rich-text-editor__toolbar-button ${active ? 'rich-text-editor__toolbar-button--active' : ''}`}
      onClick={() => execCommand(command, value)}
      title={title}
      disabled={disabled}
    >
      <Icon size={16} />
    </button>
  );

  const ToolbarSeparator = () => (
    <div className="rich-text-editor__toolbar-separator" />
  );

  return (
    <div className="rich-text-editor">
      <div className="rich-text-editor__toolbar">
        <ToolbarButton command="bold" icon={FiBold} title="Жирный (Ctrl+B)" />
        <ToolbarButton command="italic" icon={FiItalic} title="Курсив (Ctrl+I)" />
        <ToolbarButton command="underline" icon={FiUnderline} title="Подчеркнутый (Ctrl+U)" />
        <ToolbarButton command="strikeThrough" icon={BsTypeStrikethrough} title="Зачеркнутый" />
        
        <ToolbarSeparator />
        
        <ToolbarButton command="insertUnorderedList" icon={FiList} title="Маркированный список" />
        <ToolbarButton command="insertOrderedList" icon={IoListOutline} title="Нумерованный список" />
        
        <ToolbarSeparator />
        
        <ToolbarButton command="justifyLeft" icon={FiAlignLeft} title="По левому краю" />
        <ToolbarButton command="justifyCenter" icon={FiAlignCenter} title="По центру" />
        <ToolbarButton command="justifyRight" icon={FiAlignRight} title="По правому краю" />
        
        <ToolbarSeparator />
        
        <ToolbarButton command="formatBlock" value="H2" icon={FiType} title="Заголовок" />
        <ToolbarButton command="formatBlock" value="BLOCKQUOTE" icon={BsChatSquareQuote} title="Цитата" />
        <ToolbarButton command="formatBlock" value="PRE" icon={FiCode} title="Код" />
        
        <ToolbarSeparator />
        
        <ToolbarButton command="insertHorizontalRule" icon={FiMinus} title="Горизонтальная линия" />
        <ToolbarButton command="insertLink" icon={FiLink} title="Ссылка" onClick={handleLink} />
      </div>
      
      <div
        ref={editorRef}
        className="rich-text-editor__content"
        contentEditable={!disabled}
        onInput={handleInput}
        suppressContentEditableWarning
      />
      
      {isLinkModalOpen && (
        <div className="rich-text-editor__modal-overlay" onClick={() => setIsLinkModalOpen(false)}>
          <div className="rich-text-editor__modal" onClick={(e) => e.stopPropagation()}>
            <h3 className="rich-text-editor__modal-title">Добавить ссылку</h3>
            <input
              type="url"
              className="rich-text-editor__modal-input"
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
              placeholder="https://example.com"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  insertLink();
                } else if (e.key === 'Escape') {
                  setIsLinkModalOpen(false);
                }
              }}
            />
            <div className="rich-text-editor__modal-actions">
              <button
                type="button"
                className="rich-text-editor__modal-button rich-text-editor__modal-button--secondary"
                onClick={() => setIsLinkModalOpen(false)}
              >
                Отмена
              </button>
              <button
                type="button"
                className="rich-text-editor__modal-button rich-text-editor__modal-button--primary"
                onClick={insertLink}
              >
                Добавить
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
